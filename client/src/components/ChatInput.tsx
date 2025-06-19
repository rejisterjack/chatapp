import { Send, Loader2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'

interface Props {
  onSendMessage: (message: string) => void
  isResponding: boolean
}

export function ChatInput({ onSendMessage, isResponding }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isResponding) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='flex items-center p-4 border-t border-slate-200 bg-slate-50'
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Ask about the resume or start a conversation...'
        className='flex-1 p-2 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none'
        rows={1}
        disabled={isResponding}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e)
          }
        }}
      />
      <button
        type='submit'
        disabled={isResponding || !input.trim()}
        className='ml-4 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center disabled:bg-blue-300 disabled:cursor-not-allowed'
      >
        {isResponding ? (
          <Loader2 className='w-5 h-5 animate-spin' />
        ) : (
          <Send className='w-5 h-5' />
        )}
      </button>
    </form>
  )
}
