import { StateGraph, END } from '@langchain/langgraph'
import { ChatGroq } from '@langchain/groq'

import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { GraphState } from '../types'

const model = new ChatGroq({
  model: 'llama3-8b-8192',
  temperature: 0.7,
})

const callModel = async (state: GraphState): Promise<Partial<GraphState>> => {
  const { messages, document_context } = state

  const systemMessage = document_context
    ? new SystemMessage(
        `You are a helpful assistant. You have been provided with the following document. Use it to answer the user's questions if they are relevant. \n\n--- DOCUMENT START ---\n${document_context}\n--- DOCUMENT END ---`
      )
    : new SystemMessage('You are a helpful assistant.')

  const messagesWithSystem = [systemMessage, ...messages]

  console.log('Invoking model with messages:', messagesWithSystem)

  const response = await model.invoke(messagesWithSystem)

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

workflow.addConditionalEdges('llm', () => END)

export const app = workflow.compile()
