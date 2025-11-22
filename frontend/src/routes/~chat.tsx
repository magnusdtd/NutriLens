import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import type { IconName } from 'lucide-react/dynamic'
import { DynamicIcon } from 'lucide-react/dynamic'
import image from '/icons/image.svg'
import chat from '@/services/chat.service'

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

type Message = {
  id: number
  sender: 'user' | 'bot'
  text: string
  emphasized?: boolean
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const hasStarted = messages.length > 0

  const handleSend = async (value?: string) => {
    const content = (value ?? input).trim()
    if (!content) return

    setInput('')

    const chatResponse = await chat({
      message: content,
    })

    const responseMsg = chatResponse
      ? chatResponse
      : 'An error occur, please try again'

    setMessages((prev) => {
      if (prev.length === 0) {
        const userMessage: Message = {
          id: 1,
          sender: 'user',
          text: content,
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
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm lg:text-base ${
                isBot
                  ? message.emphasized
                    ? 'bg-white border border-gray-300'
                    : 'bg-transparent'
                  : 'bg-primary text-white rounded-br-sm'
              }`}
            >
              {message.text}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChatInputBar({
  value,
  onChange,
  onSend,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FBFDF5] px-4 pb-6 pt-3">
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full bg-white px-4 lg:px-6 py-2 lg:py-4 shadow-md border border-gray-200">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your meal..."
          className="flex-1 border-none bg-transparent text-sm lg:text-base text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <button
          type="button"
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
    </div>
  )
}
