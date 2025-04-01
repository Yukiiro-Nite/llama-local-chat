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
  return (
    <ul>
      {chat.chatHistory.length === 0 && <li>No chat messages</li>}
      {chat.chatHistory.map((msg) => {
        const title = roleTitles[msg.role](chat)
        const createdAt = new Date(msg.createdAt).toLocaleString()
        return (
          <li key={`${chat.id}-${msg.createdAt}`}>
            <h2>{title}</h2>
            <time>{createdAt}</time>
            <div>{msg.content}</div>
          </li>
        )
      })}
    </ul>
  )
}