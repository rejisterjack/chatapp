// src/index.ts
import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { HumanMessage } from '@langchain/core/messages'

import { getTextFromPdf } from './lib/pdfParser'
import { app as langGraphApp } from './services/graph'

// In-memory storage for the parsed document context.
// WARNING: This is for demonstration only! In a real application,
// you would use a database or a proper session store (e.g., Redis)
// to handle multiple users and sessions.
let fileContext: string | null = null

const app = new Elysia()
  // Add plugins
  .use(cors())
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: {
          title: 'Chatbot API Documentation',
          version: '1.0.0',
        },
      },
    })
  )

  // Health check endpoint
  .get('/', () => ({ status: 'ok' }))

  // API Group
  .group('/api', (app) =>
    app
      // Endpoint to upload and process a file
      .post(
        '/upload',
        async ({ body, set }) => {
          console.log('Received file upload request')
          const file = body.file

          try {
            const fileBuffer = Buffer.from(await file.arrayBuffer())
            const parsedText = await getTextFromPdf(fileBuffer)

            // Store the context in our simple in-memory store
            fileContext = parsedText

            console.log(
              `Successfully parsed and stored context from ${file.name}. Length: ${parsedText.length}`
            )

            return {
              message: 'File uploaded and processed successfully.',
              fileName: file.name,
              content_preview: parsedText.substring(0, 200) + '...',
            }
          } catch (error: any) {
            set.status = 500
            return { error: 'Failed to process file.', details: error.message }
          }
        },
        {
          body: t.Object({
            file: t.File({
              type: 'application/pdf',
              maxSize: '10m', // Limit file size to 10MB
            }),
          }),
        }
      )

      // Endpoint for chat conversations
      .post(
        '/chat',
        async ({ body, set }) => {
          const { message, conversationId } = body
          console.log(
            `Chat request for conversation '${conversationId}' with message: "${message}"`
          )

          try {
            const inputs = {
              messages: [new HumanMessage(message)],
              // Pass the stored document context to the graph
              document_context: fileContext,
            }

            // We use a unique thread_id for each conversation.
            // LangGraph uses this to manage state persistence internally.
            const config = { configurable: { thread_id: conversationId } }

            const response = await langGraphApp.invoke(inputs, config)

            // The response.messages contains the AIMessage from the model
            const aiResponse = response.messages[response.messages.length - 1]

            return {
              response: aiResponse.content,
            }
          } catch (error: any) {
            console.error('Error during chat processing:', error)
            set.status = 500
            return {
              error: 'An error occurred during the chat.',
              details: error.message,
            }
          }
        },
        {
          body: t.Object({
            message: t.String(),
            conversationId: t.String(),
          }),
        }
      )
  )
  .listen(8080)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)
console.log(
  `📄 Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/docs`
)
