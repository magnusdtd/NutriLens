import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface ChatRequest {
  userId?: string
  chatId?: string
  message?: string
  token: string | null
  image?: File | Blob
}

export default async function chat(chatRequest: ChatRequest) {
  try {
    const token = chatRequest.token

    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    if (chatRequest.image) {
      const formData = new FormData()
      if (chatRequest.message) formData.append('message', chatRequest.message)
      if (chatRequest.userId) formData.append('userId', chatRequest.userId)
      if (chatRequest.chatId) formData.append('chatId', chatRequest.chatId)
      formData.append('image', chatRequest.image)
      if (token) formData.append('token', token)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/chat`,
        formData,
        { headers: { ...headers, 'Content-Type': 'multipart/form-data' } },
      )
      return response.data.reply
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/chat`,
      chatRequest,
      { headers },
    )
    return response.data.reply
  } catch (error) {
    handleAxiosError(error)
  }
}
