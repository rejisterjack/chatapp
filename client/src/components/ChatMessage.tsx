import { Bot, User } from 'lucide-react'
import { type Message } from '../App'

interface Props {
  message: Message
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center'>
          <Bot className='w-6 h-6 text-slate-600' />
        </div>
      )}
      <div
        className={`max-w-xl p-3 rounded-lg shadow-md ${
          isUser ? 'bg-blue-500 text-white' : 'bg-white text-slate-800'
        }`}
      >
        <div className='prose prose-sm text-inherit'>{message.content}</div>
      </div>
      {isUser && (
        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center'>
          <User className='w-6 h-6 text-slate-600' />
        </div>
      )}
    </div>
  )
}
