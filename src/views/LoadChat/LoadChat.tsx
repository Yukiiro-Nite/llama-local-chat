import { useCallback } from "react"
import { View } from "../../components/View/View"
import { AppViews, useAppStore } from "../../stores/AppStore"
import { useChatStore } from "../../stores/ChatStore"

export const LoadChat = () => {
  const setView = useAppStore((state) => state.setView)
  const chats = useChatStore((state) => state.chats)
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId)
  const deleteChat = useChatStore((state) => state.deleteChat)
  const handleGoBack = useCallback(() => {
    setView(AppViews.startMenu)
  }, [setView])
  const handleLoadChat = useCallback((id: string) => {
    setCurrentChatId(id)
    setView(AppViews.chatView)
  }, [setView, setCurrentChatId])
  const handleDeleteChat = useCallback((id: string) => {
    deleteChat(id)
  }, [deleteChat])

  return (
    <View
      type={AppViews.loadChat}
      className="LoadChat"
    >
      <header>
        <button
          onClick={handleGoBack}
          title="Go back"
        >🔙</button>
        <h1>Load Chat</h1>
      </header>
      <ul>
        {
          Object.values(chats).map((chat) => {
            return (
              <li key={chat.id}>
                <h2>{chat.chatSettings.title}</h2>
                <time>Created at: {chat.createdAt}</time>
                <time>Updated at: {chat.updatedAt}</time>
                <button onClick={() => handleLoadChat(chat.id)}>Load</button>
                <button onClick={() => handleDeleteChat(chat.id)}>Delete</button>
              </li>
            )
          })
        }
      </ul>
    </View>
  )
}