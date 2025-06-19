import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { type ChangeEvent, useRef } from 'react'
import { type UploadedFile } from '../App'

interface Props {
  uploadedFile: UploadedFile | null
  handleFileUpload: (file: File) => void
  isUploading: boolean
  allowedTypes?: string[]
}

export function FileUpload({
  uploadedFile,
  handleFileUpload,
  isUploading,
  allowedTypes = ['application/pdf'],
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const statusIcon = () => {
    if (isUploading)
      return <Loader2 className='w-5 h-5 text-blue-500 animate-spin' />
    if (uploadedFile?.status === 'error')
      return <AlertCircle className='w-5 h-5 text-red-500' />
    if (uploadedFile?.status === 'success')
      return <CheckCircle className='w-5 h-5 text-green-500' />
    return <FileText className='w-5 h-5 text-slate-500' />
  }

  return (
    <div className='p-4 border-t border-slate-200 bg-slate-50'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={onFileChange}
        className='hidden'
        accept={allowedTypes?.join(',')}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <Upload className='w-4 h-4' />
        Upload PDF Resume
      </button>
      {uploadedFile && (
        <div className='mt-3 flex items-center gap-3 p-2 bg-white border rounded-md'>
          {statusIcon()}
          <span className='text-sm text-slate-600 truncate'>
            {uploadedFile.name}
          </span>
        </div>
      )}
    </div>
  )
}
