import { StateGraph, END } from '@langchain/langgraph'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages'
import { GraphState } from '../types'

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL

console.log(`[Ollama] Connecting to Ollama at: ${ollamaBaseUrl}`)

const model = new ChatOllama({
  baseUrl: ollamaBaseUrl,
  model: 'llama3',
  temperature: 0.7,
})

const callModel = async (state: GraphState): Promise<Partial<GraphState>> => {
  const { messages, document_context } = state

  const systemMessage = document_context
    ? new SystemMessage(
        `You are a helpful assistant. You have been provided with the following document. Use it to answer the user's questions if they are relevant. \n\n--- DOCUMENT START ---\n${document_context}\n--- DOCUMENT END ---`
      )
    : new SystemMessage('You are a helpful assistant.')

  const latestMessage = messages[messages.length - 1]

  const messagesForModel: BaseMessage[] = [systemMessage, latestMessage]

  console.log('Invoking model with messages:', messagesForModel)

  const response = await model.invoke(messagesForModel)

  console.log('Model response:', response)

  return {
    messages: [response],
  }
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
  },
})

workflow.addNode('llm', callModel)
workflow.setEntryPoint('llm')

workflow.addConditionalEdges('llm', () => 'end', {
  end: END,
})

export const app = workflow.compile()
