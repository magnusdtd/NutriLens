import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'

export default async function getProfile(token: string) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/user/me`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}
