import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

interface SignupRequest {
  username: string
  email: string
  password: string
}

export default async function signup(req: SignupRequest) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
      req,
    )
    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}
