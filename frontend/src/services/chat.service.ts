import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface ChatRequest {
  userId?: string
  chatId?: string
  message: string
}

export default async function chat(chatRequest: ChatRequest) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/chat`,
      chatRequest,
    )
    return response.data.reply
  } catch (error) {
    handleAxiosError(error)
  }
}
