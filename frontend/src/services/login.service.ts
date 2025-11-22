import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface LoginRequest {
  email: string
  password: string
}

export default async function login(req: LoginRequest) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
      req,
    )
    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}
