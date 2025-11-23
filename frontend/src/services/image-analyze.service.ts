import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface ImageRequest {
  image: File | Blob
  token: string | null
}

export default async function imageAnalyze({ image, token }: ImageRequest) {
  try {
    const formData = new FormData()
    formData.append('image', image)

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/vision/analyze`,
      formData,
      { headers }
    )

    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}
