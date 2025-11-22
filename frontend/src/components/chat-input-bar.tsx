import image from '/icons/image.svg'
import { Send, X } from 'lucide-react'
import { useRef, type ChangeEvent, type KeyboardEvent } from 'react'

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  imagePreview?: string | null
  onImageSelect: (file: File) => void
  onRemoveImage: () => void
}

export default function ChatInputBar({
  value,
  onChange,
  onSend,
  imagePreview,
  onImageSelect,
  onRemoveImage,
}: ChatInputBarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSend()
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FBFDF5] px-4 pb-6 pt-3">
      <div className="mx-auto max-w-xl rounded-2xl bg-white px-4 lg:px-6 py-3 lg:py-4 shadow-md border border-gray-200 flex flex-col gap-3">
        {imagePreview && (
          <div className="relative w-16 h-16 ">
            <img
              src={imagePreview}
              alt="Preview"
              className=" rounded-xl w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="size-4" />
              <span className="sr-only">Remove image</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your meal..."
            className="flex-1 border-none bg-transparent text-sm lg:text-base text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-charcoal"
          >
            <img className="size-6" src={image} alt="" />
            <span className="sr-only">Attach image</span>
          </button>
          <button
            type="button"
            onClick={onSend}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-white"
          >
            <Send className="size-4" />
            <span className="sr-only">Send message</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
