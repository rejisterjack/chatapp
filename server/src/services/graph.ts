// src/services/graph.ts
import { StateGraph, END } from '@langchain/langgraph'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { GraphState } from '../types'

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL;

// Initialize the Ollama model.
// Assumes OLLAMA_BASE_URL is set in your environment variables.
const model = new ChatOllama({
  baseUrl: ollamaBaseUrl,
  model: 'llama3', // Make sure you have this model. Run `ollama pull llama3`
  temperature: 0.7,
})

/**
 * The primary node for our graph. It takes the current state,
 * formats a prompt with document context (if any),
 * and calls the Ollama model to get a response.
 */
const callModel = async (state: GraphState): Promise<Partial<GraphState>> => {
  const { messages, document_context } = state

  // Create a system message with context if a document has been uploaded.
  const systemMessage = document_context
    ? new SystemMessage(
        `You are a helpful assistant. You have been provided with the following document. Use it to answer the user's questions if they are relevant. \n\n--- DOCUMENT START ---\n${document_context}\n--- DOCUMENT END ---`
      )
    : new SystemMessage('You are a helpful assistant.')

  // Prepend the system message to the conversation
  const messagesWithSystem = [systemMessage, ...messages]

  console.log('Invoking model with messages:', messagesWithSystem)

  // Call the model
  const response = await model.invoke(messagesWithSystem)

  console.log('Model response:', response)

  // Return the new state, appending the AI's response
  return {
    messages: [response], // We only return the latest AI message to be appended
  }
}

// Define the workflow, a state machine
const workflow = new StateGraph<GraphState>({
  channels: {
    messages: {
      value: (x, y) => x.concat(y), // Always append new messages
      default: () => [],
    },
    document_context: {
      value: (x, y) => y ?? x, // Overwrite context when new one is provided
      default: () => undefined,
    },
  },
})

// Define the single node in our graph
workflow.addNode('llm', callModel)

// Set the entrypoint
workflow.setEntryPoint('llm')

// All roads lead to the end after the LLM call
workflow.addConditionalEdges('llm', () => END)

// Compile the graph into a runnable app
export const app = workflow.compile()
