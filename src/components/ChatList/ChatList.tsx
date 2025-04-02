import { useEffect, useRef } from "react"
import { Chat, ChatRoleType } from "../../stores/ChatStore"

export interface ChatListProps {
  chat: Chat
}

const roleTitles: Record<ChatRoleType, (chat: Chat) => string> = {
  'user': () => 'You',
  'assistant': (chat) => `Agent ${chat.chatSettings.model}`,
  'system': () => 'System'
}

export const ChatList = ({ chat }: ChatListProps) => {
  const chatAnchorRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (chatAnchorRef.current) {
      chatAnchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat])

  return (
    <ul key={chat.id}>
      {chat.chatHistory.length === 0 && <li><h2>No chat messages</h2></li>}
      {chat.chatHistory.map((msg) => {
        const title = roleTitles[msg.role](chat)
        const createdAt = new Date(msg.createdAt).toLocaleString()
        return (
          <li key={`${chat.id}-${msg.createdAt}`}>
            <h2>{title}</h2>
            <time>{createdAt}</time>
            <div className="ChatMsg">{msg.content}</div>
          </li>
        )
      })}
      <li ref={chatAnchorRef}></li>
    </ul>
  )
}