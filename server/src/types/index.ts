import { BaseMessage } from '@langchain/core/messages'

export interface GraphState {
  messages: BaseMessage[]
  document_context?: string
}
