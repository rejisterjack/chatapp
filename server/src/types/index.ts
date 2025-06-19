import { BaseMessage } from '@langchain/core/messages'
import { BufferMemory } from 'langchain/memory'

export type GraphState = {
  messages: BaseMessage[]
  document_context?: string
  memory?: BufferMemory
  model?: 'ollama' | 'groq'
}
