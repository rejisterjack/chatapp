import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatInput } from './components/ChatInput'
import { FileUpload } from './components/FileUpload'
import { ChatMessage } from './components/ChatMessage'
import { useUpload } from './hooks/useUpload'
import { Bot, Github } from 'lucide-react'
import { Chat } from './components/Chat'

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
  const [isResponding, setIsResponding] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [conversationId, setConversationId] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConversationId(uuidv4())
  }, [])

  const { uploadFile, isUploading, uploadError } = useUpload()

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleFileUpload = async (file: File) => {
    setUploadedFile({ name: file.name, status: 'uploading' })
    try {
      await uploadFile(file)
      setUploadedFile({ name: file.name, status: 'success' })
      const systemMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I've finished reading **${file.name}**. You can now ask me questions about it!`,
      }
      setMessages((prev) => [...prev, systemMessage])
    } catch (e) {
      console.error(e)
      setUploadedFile({ name: file.name, status: 'error' })
    }
  }

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return

    const userMessage: Message = { id: uuidv4(), role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setIsResponding(true)
    const assistantMessageId = uuidv4()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversationId }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullResponse }
              : msg
          )
        )
      }
    } catch (error) {
      console.error('Streaming failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsResponding(false)
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <header className='p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold'>PDF Chat Assistant</h1>
            <p className='text-blue-100 text-sm mt-1'>
              Upload PDFs and chat with AI about their content
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center bg-blue-500/20 px-3 py-1 rounded-full'>
              <div className='w-2 h-2 bg-green-400 rounded-full mr-2'></div>
              <span className='text-sm'>Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4'>
        <div className='flex-1 flex flex-col bg-white rounded-xl shadow-md overflow-hidden md:h-full'>
          <div className='flex-1 overflow-auto p-4 bg-gray-50'>
            <Chat messages={messages} isResponding={isResponding} />
          </div>

          <div className='border-t border-gray-200 p-4'>
            <ChatInput
              onSendMessage={handleSendMessage}
              isResponding={isResponding}
            />
          </div>
        </div>

        <div className='w-full md:w-80 flex flex-col bg-white rounded-xl shadow-md overflow-hidden h-full'>
          <div className='p-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-800'>PDF Upload</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Upload PDF files for analysis
            </p>
          </div>

          <div className='flex-1 p-4 overflow-auto flex flex-col'>
            <FileUpload
              uploadedFile={uploadedFile}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              allowedTypes={['application/pdf']}
            />

            <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100'>
              <h3 className='font-medium text-blue-800 mb-2'>How to use</h3>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  <span>Upload PDF files (max 5MB)</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  <span>Ask questions about the PDF content</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  <span>Files are processed securely</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className='py-3 px-4 text-center text-sm text-gray-500 bg-white border-t border-gray-200'>
        <div className='max-w-7xl mx-auto'>
          PDF Chat Assistant • Powered by Llama3
        </div>
      </footer>
    </div>
  )
}

export default App
