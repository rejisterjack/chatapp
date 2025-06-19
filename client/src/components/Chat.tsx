import { useEffect, useRef } from 'react'
import { type Message } from '../App'
import { ChatMessage } from './ChatMessage'

interface Props {
  messages: Message[]
  isResponding: boolean
}

export function Chat({ messages, isResponding }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isResponding])

  return (
    <div className='flex-1 p-6 space-y-6 overflow-y-auto'>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isResponding && messages.length > 0 && (
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center'>
            <div className='w-2 h-2 bg-slate-500 rounded-full animate-pulse'></div>
          </div>
          <div className='max-w-xl p-3 rounded-lg shadow-md bg-white text-slate-800'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75'></div>
              <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150'></div>
              <div className='w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300'></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
