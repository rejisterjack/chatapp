import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { HumanMessage } from '@langchain/core/messages'

import { getTextFromPdf } from './lib/pdfParser'
import { app as langGraphApp } from './services/graph'
import { BufferMemory } from 'langchain/memory'

const contextMap = new Map<string, string>()
const memoryStore = new Map<string, BufferMemory>()

const PORT = process.env.PORT || 8080

const app = new Elysia()
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

  .get('/', () => ({ status: 'ok' }))

  .group('/api', (app) =>
    app
      .post(
        '/upload',
        async ({ body, set }) => {
          console.log('Received file upload request')
          const file = body.file

          try {
            const fileBuffer = Buffer.from(await file.arrayBuffer())
            const parsedText = await getTextFromPdf(fileBuffer)

            const conversationId = crypto.randomUUID()
            contextMap.set(conversationId, parsedText)

            console.log(
              `Successfully parsed and stored context from ${file.name}. Length: ${parsedText.length}`
            )

            return {
              message: 'File uploaded and processed successfully.',
              fileName: file.name,
              conversationId,
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
              maxSize: '10m',
            }),
          }),
        }
      )

      .post(
        '/chat',
        async ({ body, set }) => {
          const { message, conversationId, model } = body
          console.log(
            `Chat for conversation '${conversationId}' with: "${message}"`
          )

          const document_context = contextMap.get(conversationId)
          if (!document_context) {
            set.status = 400
            return { error: 'No document uploaded for this conversationId.' }
          }

          let memory = memoryStore.get(conversationId)
          if (!memory) {
            memory = new BufferMemory({
              returnMessages: true,
              memoryKey: 'messages',
            })
            memoryStore.set(conversationId, memory)
          }

          const inputs = {
            messages: [new HumanMessage(message)],
            document_context,
            memory,
            model: model || 'groq',
          }

          const config = { configurable: { thread_id: conversationId } }

          const response = await langGraphApp.invoke(inputs, config)

          const aiResponse = response.messages[response.messages.length - 1]

          return {
            response: aiResponse.content,
          }
        },
        {
          body: t.Object({
            message: t.String(),
            conversationId: t.String(),
            model: t.Optional(
              t.Union([t.Literal('groq'), t.Literal('ollama')])
            ),
          }),
        }
      )
  )
  .listen(PORT)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)
console.log(
  `📄 Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/docs`
)
