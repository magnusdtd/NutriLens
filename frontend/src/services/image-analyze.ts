import axios from 'axios'

interface ImageRequest {
  image: File | Blob;
}

export default async function imageAnalyze({ image }: ImageRequest) {
  try {
    const formData = new FormData()
    formData.append('image', image)

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/vision/analyze`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data
  } catch (error) {
    console.error(error)
  }
}
