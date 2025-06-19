import { StateGraph, END } from '@langchain/langgraph'
import { ChatGroq } from '@langchain/groq'
import {
  BaseMessage,
  SystemMessage,
  AIMessageChunk,
} from '@langchain/core/messages'

interface GraphState {
  messages: BaseMessage[]
  document_context?: string
}

export const model = new ChatGroq({
  model: 'llama3-8b-8192',
  temperature: 0.7,
})

async function* callModel(
  state: GraphState
): AsyncGenerator<{ messages: [AIMessageChunk] }> {
  const { messages, document_context } = state

  const systemMessage = document_context
    ? new SystemMessage(
        `You are a helpful assistant. Use this document if relevant:\n${document_context}`
      )
    : new SystemMessage('You are a helpful assistant.')

  const latestMessage = messages[messages.length - 1]
  const messagesWithSystem = [systemMessage, latestMessage]

  const stream = await model.stream(messagesWithSystem)

  for await (const chunk of stream) {
    yield { messages: [chunk] }
  }
}

const workflow = new StateGraph<GraphState>({
  channels: {
    messages: {
      value: (x, y) => [...x, ...y],
      default: () => [],
    },
    document_context: {
      value: (x, y) => y ?? x,
      default: () => undefined,
    },
  },
})

workflow.addNode('llm', callModel)
workflow.setEntryPoint('llm' as '__start__')
workflow.addEdge('llm' as '__start__', END)

export const app = workflow.compile()
