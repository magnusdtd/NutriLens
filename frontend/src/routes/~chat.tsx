import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { IconName } from 'lucide-react/dynamic'
import { DynamicIcon } from 'lucide-react/dynamic'
import chat from '@/services/chat.service'
import ChatInputBar from '@/components/chat-input-bar'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

type Message = {
  id: number
  sender: 'user' | 'bot'
  text: string
  emphasized?: boolean
  imageUrl?: string | null
}

interface starterSuggestion {
  id: number
  name: IconName
  label: string
}

const starterSuggestions: starterSuggestion[] = [
  {
    id: 1,
    name: 'lightbulb',
    label: 'How can I improve this meal?',
  },
  {
    id: 2,
    name: 'alert-circle',
    label: 'Is this meal balanced?',
  },
  {
    id: 3,
    name: 'message-circle',
    label: 'What’s a healthier alternative?',
  },
]

function ChatPage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const hasStarted = messages.length > 0

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleSend = async (value?: string) => {
    const content = (value ?? input).trim()
    if (!content && !attachedImage) return

    setInput('')
    const previewForMessage = imagePreview

    const chatResponse = await chat({
      userId: user?.id,
      message: content || undefined,
      token: token,
      image: attachedImage ?? undefined,
    })

    const responseMsg = chatResponse
      ? chatResponse
      : 'An error occur, please try again'

    setAttachedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }

    setMessages((prev) => {
      if (prev.length === 0) {
        const userMessage: Message = {
          id: 1,
          sender: 'user',
          text: content,
          imageUrl: previewForMessage,
        }
        const response: Message = {
          id: 2,
          sender: 'bot',
          emphasized: true,
          text: responseMsg,
        }

        return [userMessage, response]
      }

      const nextId = prev[prev.length - 1]?.id + 1 || 1
      const response: Message = {
        id: nextId + 1,
        sender: 'bot',
        emphasized: true,
        text: responseMsg,
      }
      return [
        ...prev,
        {
          id: nextId,
          sender: 'user',
          text: content,
          imageUrl: previewForMessage,
        },
        response,
      ]
    })
  }

  const handleSuggestionClick = (label: string) => {
    handleSend(label)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-xl bg-[#FBFDF5]">
      <main className="flex-1 px-6 pt-6 pb-24">
        {!hasStarted ? (
          <StarterState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ActiveChatState messages={messages} />
        )}
      </main>

      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        imagePreview={imagePreview}
        onImageSelect={(file) => {
          if (imagePreview) URL.revokeObjectURL(imagePreview)
          setAttachedImage(file)
          setImagePreview(URL.createObjectURL(file))
        }}
        onRemoveImage={() => {
          if (imagePreview) URL.revokeObjectURL(imagePreview)
          setAttachedImage(null)
          setImagePreview(null)
        }}
      />
    </div>
  )
}

function StarterState({
  onSuggestionClick,
}: {
  onSuggestionClick: (label: string) => void
}) {
  return (
    <div className="flex h-full w-full flex-col items-center text-center">
      <div className="mt-16 lg:mt-20 mb-8 lg:mb-10 flex size-16 lg:size-20 items-center justify-center rounded-full bg-yellow-green text-primary">
        <MessageCircle className="size-8 lg:size-10" />
      </div>
      <h1 className="text-2xl lg:text-3xl font-semibold text-charcoal mb-2">
        Chat with NutriLens AI
      </h1>
      <p className="mb-8 text-sm lg:text-base text-gray-600">
        Ask any questions about your meal and get personalized nutrition advice.
      </p>

      <div className="w-full space-y-3">
        {starterSuggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onSuggestionClick(item.label)}
            className="group flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-medium shadow-sm border transition-colors bg-white border-gray-200 hover:bg-yellow-green hover:border-yellow-green-dark"
          >
            <span className="flex items-center gap-3">
              <span className="text-charcoal group-hover:text-primary">
                <DynamicIcon name={item.name} className="size-6" />
              </span>
              <span className="text-sm lg:text-base">{item.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ActiveChatState({ messages }: { messages: Message[] }) {
  return (
    <div className="flex h-full w-full flex-col gap-4 text-sm text-charcoal">
      {messages.map((message) => {
        const isBot = message.sender === 'bot'
        return (
          <div
            key={message.id}
            className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm lg:text-base space-y-2 ${
                isBot
                  ? message.emphasized
                    ? 'bg-white border border-gray-300'
                    : 'bg-transparent'
                  : 'bg-primary text-white rounded-br-sm'
              }`}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded"
                  className="max-h-48 w-auto rounded-xl object-cover"
                />
              )}
              {message.text}
            </div>
          </div>
        )
      })}
    </div>
  )
}
