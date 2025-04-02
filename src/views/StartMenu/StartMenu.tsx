import { useCallback } from "react"
import { View } from "../../components/View/View"
import { AppViews, useAppStore } from "../../stores/AppStore"
import { useChatStore } from "../../stores/ChatStore"
import './StartMenu.css'

export const StartMenu = () => {
  const setView = useAppStore((state) => state.setView)
  const {
    createNewChat,
    setCurrentChatId
  } = useChatStore()
  const handleNewChat = useCallback(() => {
    const newChat = createNewChat()
    setCurrentChatId(newChat.id)
    setView(AppViews.chatView)
  }, [setView, createNewChat, setCurrentChatId])
  const handleLoadChat = useCallback(() => {
    setView(AppViews.loadChat)
  }, [setView])

  return (
    <View
      type={AppViews.startMenu}
      className="StartMenu"
    >
      <button onClick={handleNewChat}>New chat</button>
      <button onClick={handleLoadChat}>Load chat</button>
    </View>
  )
}