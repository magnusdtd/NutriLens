import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface ChatRequest {
  userId?: string
  conversationId?: string
  message: string
  token: string | null
  image?: File | Blob
}

export default async function chat(chatRequest: ChatRequest) {
  try {
    const token = chatRequest.token

    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const formData = new FormData()
    formData.append('message', chatRequest.message)
    if (chatRequest.userId) formData.append('userId', chatRequest.userId)
    if (chatRequest.conversationId) {
      formData.append('conversationId', chatRequest.conversationId)
    }
    if (chatRequest.image) formData.append('image', chatRequest.image)

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/chat`,
      formData,
      { headers: { ...headers, 'Content-Type': 'multipart/form-data' } },
    )
    console.log(response)
    return response.data.reply
  } catch (error) {
    handleAxiosError(error)
  }
}

// export default async function chat(chatRequest: ChatRequest) {
//   try {
//     const payload = {
//       message: chatRequest.message
//     }

//     const response = await axios.post(
//       `${import.meta.env.VITE_API_URL}/api/v1/chat`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${chatRequest.token}`
//         }
//       }
//     )
//     return response.data.reply
//   } catch (error) {
//     handleAxiosError(error)
//   }
// }
