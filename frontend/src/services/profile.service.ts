import axios from 'axios'
import { handleAxiosError } from '../utils/axios-error'
import type { UserProfile } from '@/types'

export type UpdateProfileRequest = {
  username: string
  age: number
  gender: 'Male' | 'Female'
  height: number
  weight: number
  calorieGoal: number
  specialDiet: string
  cuisine: string
}

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

export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest,
  token?: string | null,
): Promise<UserProfile | void> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/user/${userId}`,
      data,
      { headers },
    )
    console.log("Update profile: ", response.data)
    return response.data
  } catch (error) {
    handleAxiosError(error)
  }
}
