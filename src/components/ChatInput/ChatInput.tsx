import { FormEvent, KeyboardEvent, useCallback, useRef, useState } from "react"
import { Chat, ChatMessage, useChatStore } from "../../stores/ChatStore"
import "./ChatInput.css"
import { ChatRoles } from "../../api/llama.types"
import { getChat } from "../../api/llama"

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
  const formRef = useRef<HTMLFormElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
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
    let chatResponse
    try {
      chatResponse = await getChat(
        settings.host,
        settings.model,
        requestHistory
      )
    } catch (res) {
      const response = res as Response
      const error = await response.text()
      console.error('Problem getting chat response: ', response.status, error)
      setRequestStatus({ loading: false, error })
      return
    }

    const responseMessage = chatResponse.message

    if (!responseMessage) {
      console.error('No message in response', chatResponse)
      setRequestStatus({ loading: false, error: 'No message in response' })
    }

    appendChatHistory(chat.id, {
      role: responseMessage.role,
      content: responseMessage.content,
      createdAt: new Date().toISOString()
    })
    setRequestStatus({ loading: false, error: undefined })
    target.reset()
    setTimeout(() => textAreaRef.current?.focus())
  }, [appendChatHistory, chat.chatSettings, chat.id])

  const handleKey = useCallback((event: KeyboardEvent) => {
    const needsSubmit = (event.key === "Enter" || event.key === "NumpadEnter")
      && !event.shiftKey
    if (needsSubmit && formRef.current) {
      formRef.current.requestSubmit()
    }
  }, [])

  return (
    <div className="ChatInput">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <textarea
          ref={textAreaRef}
          name="message"
          disabled={requestStatus.loading}
          rows={4}
          onKeyDown={handleKey}
        ></textarea>
        <button>✉️</button>
      </form>
    </div>
  )
}