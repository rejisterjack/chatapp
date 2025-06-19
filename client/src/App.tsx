import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Chat } from './components/Chat'
import { ChatInput } from './components/ChatInput'
import { FileUpload } from './components/FileUpload'
import { useChat } from './hooks/useChat'
import { useUpload } from './hooks/useUpload'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface UploadedFile {
  name: string
  status: 'idle' | 'uploading' | 'success' | 'error'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  useEffect(() => {
    setConversationId(uuidv4())
  }, [])

  const { sendMessage, isResponding, chatError } = useChat()
  const { uploadFile, isUploading, uploadError } = useUpload()

  useEffect(() => {
    if (chatError) alert(`Chat Error: ${chatError.message}`)
  }, [chatError])

  useEffect(() => {
    if (uploadError) {
      alert(`Upload Error: ${uploadError.message}`)
      if (uploadedFile) {
        setUploadedFile({ ...uploadedFile, status: 'error' })
      }
    }
  }, [uploadError, uploadedFile])

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = { id: uuidv4(), role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await sendMessage({ message: input, conversationId })
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (e) {
      console.error(e)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I ran into an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadedFile({ name: file.name, status: 'uploading' })
    try {
      await uploadFile(file)
      setUploadedFile({ name: file.name, status: 'success' })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className='flex flex-col h-screen bg-slate-100'>
      <header className='p-4 border-b border-slate-200 bg-white shadow-sm'>
        <h1 className='text-xl font-bold text-slate-800'>AI Chatbot</h1>
        <p className='text-sm text-slate-500'>
          Powered by LangGraph, Ollama, and React
        </p>
      </header>

      <main className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Chat messages={messages} isResponding={isResponding} />
          <ChatInput
            onSendMessage={handleSendMessage}
            isResponding={isResponding}
          />
        </div>

        <aside className='w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white'>
          <FileUpload
            uploadedFile={uploadedFile}
            handleFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        </aside>
      </main>
    </div>
  )
}

export default App
