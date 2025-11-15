import { Upload } from 'lucide-react'
import { type ChangeEvent, useRef } from 'react'

type UploadImageProps = {
  onImageSelected: (file: File) => void
}

export default function UploadImage({ onImageSelected }: UploadImageProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onImageSelected(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full pt-4 min-h-40 flex flex-col items-center justify-center rounded-lg bg-secondary border border-gray-300 border-dashed"
      >
        <div className="size-11 p-3 rounded-full bg-yellow-green flex items-center justify-center mb-2">
          <Upload className="text-primary w-full" />
        </div>
        <h3 className="text-charcoal text-base font-medium">
          Upload your meal image
        </h3>
        <p className="text-gray-600 text-sm">
          Drag and drop or click to browse
        </p>
      </button>
    </>
  )
}
