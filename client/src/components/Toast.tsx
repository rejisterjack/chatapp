import React from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className='fixed top-4 right-4 z-50 animate-fadeIn'>
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center`}
      >
        <span className='mr-3'>{message}</span>
        <button
          onClick={onClose}
          className='text-white hover:text-gray-100 focus:outline-none'
        >
          <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
