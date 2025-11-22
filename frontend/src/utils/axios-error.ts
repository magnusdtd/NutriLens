import axios from 'axios'

export function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.response?.statusText ||
      error.message ||
      'Request failed'
    // Log raw response data for debugging context; UI gets a clean error.
    console.error('Axios error', {
      message,
      status: error.response?.status,
      data: error.response?.data,
    })
    throw new Error(message)
  }

  console.error('Unexpected error', error)
  throw error instanceof Error ? error : new Error('Unexpected error')
}
