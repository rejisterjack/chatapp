import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Chat } from './components/Chat'
import { ChatInput } from './components/ChatInput'
import { FileUpload } from './components/FileUpload'
import { useChat } from './hooks/useChat'
import { useUpload } from './hooks/useUpload'
import { Toast } from './components/Toast'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface UploadedFile {
  name: string
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { sendMessage, isResponding } = useChat()
  const { uploadFile, isUploading } = useUpload()
  const conversationId = uuidv4()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await sendMessage({ message: input, conversationId })
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Could you please try again?',
      }
      setMessages((prev) => [...prev, errorMessage])
      showToast('Failed to send message. Please try again.', 'error')
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadedFile({
        name: file.name,
        status: 'error',
        error: 'Only PDF files are supported',
      })
      showToast('Only PDF files are supported', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadedFile({
        name: file.name,
        status: 'error',
        error: 'File size exceeds 5MB limit',
      })
      showToast('File size exceeds 5MB limit', 'error')
      return
    }

    setUploadedFile({ name: file.name, status: 'uploading' })

    try {
      await uploadFile(file)
      setUploadedFile({ name: file.name, status: 'success' })
      showToast('File uploaded successfully!', 'success')
    } catch (error) {
      console.error('Upload error:', error)
      setUploadedFile({
        name: file.name,
        status: 'error',
        error: 'Failed to upload file',
      })
      showToast('Failed to upload file', 'error')
    }
  }

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
