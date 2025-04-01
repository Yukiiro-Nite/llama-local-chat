import { useCallback, useMemo } from "react"
import { ChatInput } from "../../components/ChatInput/ChatInput"
import { ChatList } from "../../components/ChatList/ChatList"
import { View } from "../../components/View/View"
import { AppViews, useAppStore } from "../../stores/AppStore"
import { useChatStore } from "../../stores/ChatStore"

export const ChatView = () => {
  const setView = useAppStore((state) => state.setView)
  const {chats, currentChatId} = useChatStore()
  const chat = useMemo(() => {
    return currentChatId
      ? chats[currentChatId]
      : undefined
  }, [chats, currentChatId])
  const handleViewHome = useCallback(() => {setView(AppViews.startMenu)}, [setView])
  const handleViewSettings = useCallback(() => {setView(AppViews.chatSettings)}, [setView])

  return (
    <View
      type={AppViews.chatView}
      className="ChatView"
    >
      <header>
        <nav>
          <button
            onClick={handleViewHome}
            title="home"
          >🏠</button>
          <button
            onClick={handleViewSettings}
            title="settings"
          >⚙️</button>
        </nav>
        <h1>{chat?.chatSettings.title}</h1>
      </header>
      {
        chat &&
        <>
          <ChatList chat={chat} />
          <ChatInput chat={chat} />
        </>
      }
    </View>
  )
}