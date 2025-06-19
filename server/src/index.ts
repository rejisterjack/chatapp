import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { HumanMessage } from '@langchain/core/messages'
import { getTextFromPdf } from './lib/pdfParser'
import { app as langGraphApp } from './services/graph'

let fileContext: string | null = null

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
          const file = body.file
          try {
            const fileBuffer = Buffer.from(await file.arrayBuffer())
            const parsedText = await getTextFromPdf(fileBuffer)
            fileContext = parsedText
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
              maxSize: '10m',
            }),
          }),
        }
      )
      .post(
        '/chat',
        async function* ({ body }) {
          const { message, conversationId } = body

          const inputs = {
            messages: [new HumanMessage(message)],
            document_context: fileContext,
          }

          const config = {
            configurable: { thread_id: conversationId },
            streamMode: 'updates',
          }

          try {
            const streamResponse = await langGraphApp.stream(inputs, config)

            for await (const event of streamResponse) {
              console.log('LangGraph event:', event)
              if (event.llm) {
                const chunk = event.llm.messages[0]?.content
                if (typeof chunk === 'string' && chunk.length > 0) {
                  yield chunk
                }
              }
            }
          } catch (error: any) {
            console.error('LangGraph streaming error:', error)
            yield 'Error: An error occurred during the stream.'
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
