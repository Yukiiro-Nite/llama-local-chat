import { FormEvent, useCallback, useState } from "react"
import { Chat, ChatMessage, ChatRoles, useChatStore } from "../../stores/ChatStore"
import "./ChatInput.css"

interface ChatInputFormElements extends HTMLFormControlsCollection {
  message: HTMLTextAreaElement
}

export interface ChatInputProps {
  chat: Chat
}

export interface ChatRequestStatus {
  loading: boolean
  error?: string
}

export const ChatInput = ({ chat }: ChatInputProps) => {
  const [requestStatus, setRequestStatus] = useState<ChatRequestStatus>({loading: false})
  const appendChatHistory = useChatStore((state) => state.appendChatHistory)
  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault()
    const target = event.target as HTMLFormElement
    const elements = target.elements as ChatInputFormElements
    const message = elements.message.value

    const newChat: ChatMessage = {
      role: ChatRoles.user,
      content: message,
      createdAt: new Date().toISOString()
    }
    const chatHistory = appendChatHistory(chat.id, newChat)
    const settings = chat.chatSettings
    const requestHistory = chatHistory
      .slice()
      .reverse()
      .slice(0, settings.historyLength)
      .map(({role, content}) => ({role, content}))
      .reverse()
    
    if (settings.systemMessage) {
      requestHistory.unshift({
        role: 'system',
        content: settings.systemMessage
      })
    }

    setRequestStatus({loading: true})
    const response = await fetch(
      `${settings.host}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: settings.model,
          stream: false,
          messages: requestHistory
        })
      }
    )

    if (response.status !== 200) {
      const error = await response.text()
      console.error('Problem getting chat response: ', response.status, error)
      setRequestStatus({ loading: false, error })
    }

    const rawData = await response.json()
    const responseMessage = rawData?.message

    if (!responseMessage) {
      console.error('No message in response', rawData)
      setRequestStatus({ loading: false, error: 'No message in response' })
    }

    appendChatHistory(chat.id, {
      role: responseMessage.role,
      content: responseMessage.content,
      createdAt: new Date().toISOString()
    })
    setRequestStatus({ loading: false, error: undefined })
    target.reset()
  }, [appendChatHistory, chat.chatSettings, chat.id])

  return (
    <div className="ChatInput">
      <form onSubmit={handleSubmit}>
        <textarea
          name="message"
          disabled={requestStatus.loading}
          rows={4}
        ></textarea>
        <button>✉️</button>
      </form>
    </div>
  )
}