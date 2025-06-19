import useSWRMutation from 'swr/mutation'
import { BASE_URL } from '../config'

interface ChatPayload {
  message: string
  conversationId: string
}

async function chatFetcher(url: string, { arg }: { arg: ChatPayload }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorInfo = await response.json()
    throw new Error(errorInfo.error || 'Failed to get a response')
  }

  return response.json()
}

export function useChat() {
  const { trigger, isMutating, error } = useSWRMutation(
    `${BASE_URL}/api/chat`,
    chatFetcher
  )

  return {
    sendMessage: trigger,
    isResponding: isMutating,
    chatError: error,
  }
}
