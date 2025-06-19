import { StateGraph, END } from '@langchain/langgraph'
import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { SystemMessage } from '@langchain/core/messages'
import { GraphState } from '../types'

const useOllama = process.env.USE_OLLAMA === 'true'

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

const model = useOllama
  ? new ChatOllama({
      baseUrl: ollamaBaseUrl,
      model: 'llama3',
      temperature: 0.7,
    })
  : new ChatGroq({
      model: 'llama3-8b-8192',
      temperature: 0.7,
    })

const callModel = async (state: GraphState): Promise<Partial<GraphState>> => {
  const { messages, document_context, memory } = state

  const systemMessage = document_context
    ? new SystemMessage(
        `You are a helpful assistant. You have been provided with the following document. Use it to answer the user's questions if they are relevant. \n\n--- DOCUMENT START ---\n${document_context}\n--- DOCUMENT END ---`
      )
    : new SystemMessage('You are a helpful assistant.')

  const memoryVars = (await memory?.loadMemoryVariables({})) ?? {}
  const historyMessages = memoryVars.messages ?? []

  const messagesWithSystem = [systemMessage, ...historyMessages, ...messages]

  console.log('Invoking model with messages:', messagesWithSystem)

  const response = await model.invoke(messagesWithSystem)

  await memory?.saveContext(
    { input: messages[0].content },
    { output: response.content }
  )

  return { messages: [response] }
}

const workflow = new StateGraph<GraphState>({
  channels: {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
    document_context: {
      value: (x, y) => y ?? x,
      default: () => undefined,
    },
    memory: {
      value: (x, y) => y ?? x,
      default: () => undefined,
    },
  },
})

workflow.addNode('llm', callModel)
workflow.setEntryPoint('llm' as '__start__')
workflow.addConditionalEdges('llm' as '__start__', () => END)

export const app = workflow.compile()
