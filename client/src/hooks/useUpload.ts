import useSWRMutation from 'swr/mutation'
import { BASE_URL } from '../config'

async function uploadFetcher(url: string, { arg }: { arg: File }) {
  const formData = new FormData()
  formData.append('file', arg)

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorInfo = await response.json()
    throw new Error(errorInfo.error || 'File upload failed')
  }

  return response.json()
}

export function useUpload() {
  const { trigger, isMutating, error } = useSWRMutation(
    `${BASE_URL}/api/upload`,
    uploadFetcher
  )

  return {
    uploadFile: trigger,
    isUploading: isMutating,
    uploadError: error,
  }
}
