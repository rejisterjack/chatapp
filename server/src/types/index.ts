import { BaseMessage } from '@langchain/core/messages'

export type GraphState = {
  messages: BaseMessage[]
  document_context?: string
  latest_response: string
}
