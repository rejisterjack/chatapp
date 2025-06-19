import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type Message } from '../App'

interface Props {
  message: Message
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex items-start gap-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center`}
      >
        {isUser ? (
          <User className='w-5 h-5 text-slate-700' />
        ) : (
          <Bot className='w-5 h-5 text-slate-700' />
        )}
      </div>
      <div
        className={`max-w-2xl px-4 py-3 rounded-xl shadow-sm ${
          isUser ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
        }`}
      >
        <article className='prose prose-sm prose-p:my-0 prose-headings:my-2 prose-ol:my-2 prose-ul:my-2 max-w-none text-inherit'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
