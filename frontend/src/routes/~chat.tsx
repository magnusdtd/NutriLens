import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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

const formatMessage = (text: string) => {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br />')
  return `<p>${html}</p>`
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
  const [isSending, setIsSending] = useState(false)

  const hasStarted = messages.length > 0

  const handleSend = async (value?: string) => {
    if (isSending) return
    const content = (value ?? input).trim()
    if (!content && !attachedImage) return

    setIsSending(true)
    setInput('')
    const previewForMessage = imagePreview
    setAttachedImage(null)
    setImagePreview(null)

    let pendingResponseId = 0
    setMessages((prev) => {
      const nextId = prev[prev.length - 1]?.id + 1 || 1
      const userMessage: Message = {
        id: nextId,
        sender: 'user',
        text: content,
        imageUrl: previewForMessage,
      }
      const placeholder: Message = {
        id: nextId + 1,
        sender: 'bot',
        emphasized: true,
        text: 'NutriLens is thinking...',
      }
      pendingResponseId = placeholder.id
      return [...prev, userMessage, placeholder]
    })

    try {
      const chatResponse = await chat({
        userId: user?.id,
        message: content,
        token: token,
        image: attachedImage || undefined,
      })

      const responseMsg = chatResponse
        ? chatResponse
        : 'An error occur, please try again'

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingResponseId ? { ...msg, text: responseMsg } : msg
        )
      )
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingResponseId
            ? { ...msg, text: 'An error occur, please try again' }
            : msg
        )
      )
    } finally {
      setIsSending(false)
    }
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
        disabled={isSending}
        imagePreview={imagePreview}
        onImageSelect={(file) => {
          setAttachedImage(file)
          setImagePreview(URL.createObjectURL(file))
        }}
        onRemoveImage={() => {
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
        const bubbleBase =
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm lg:text-base space-y-2'
        const bubbleStyle = isBot
          ? message.emphasized
            ? 'bg-white border border-gray-300'
            : 'bg-transparent'
          : 'bg-primary text-white rounded-br-sm'

        return (
          <div key={message.id} className="flex w-full flex-col gap-2">
            {message.imageUrl && (
              <div
                className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className="max-w-[80%] overflow-hidden rounded-2xl border border-gray-200 bg-white p-2">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded"
                    className="max-h-64 w-full rounded-xl object-cover"
                  />
                </div>
              </div>
            )}
            {message.text && (
              <div
                className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`${bubbleBase} ${bubbleStyle} leading-relaxed`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
