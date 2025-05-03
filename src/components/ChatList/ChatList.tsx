import { useEffect, useRef } from "react"
import { Chat } from "../../stores/ChatStore"
import { compiler } from "markdown-to-jsx"
import { ChatRoleType } from "../../api/llama.types"
import classNames from "classnames"
import './ChatList.css'

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
    <ul
      key={chat.id}
      className="ChatList"
    >
      {chat.chatHistory.length === 0 && <li><h2>No chat messages</h2></li>}
      {chat.chatHistory.map((msg, index) => {
        const title = roleTitles[msg.role](chat)
        const createdAt = new Date(msg.createdAt).toLocaleString()
        const contentMd = compiler(msg.content, { wrapper: null })
        const outsideOfHistoryWindow = (chat.chatHistory.length - index) > chat.chatSettings.historyLength
        const chatMessageClasses = classNames("ChatMessage", {
          "excludeHistory": outsideOfHistoryWindow
        })
        const messageTitle = outsideOfHistoryWindow
          ? `This message is out of the history window. Try changing the history length if you want to include this message.`
          : ""
        return (
          <li
            key={`${chat.id}-${msg.createdAt}`}
            className={chatMessageClasses}
            title={messageTitle}
          >
            <h2>{title}</h2>
            <time>{createdAt}</time>
            <div className="ChatMsg">{contentMd}</div>
          </li>
        )
      })}
      <li ref={chatAnchorRef}></li>
    </ul>
  )
}