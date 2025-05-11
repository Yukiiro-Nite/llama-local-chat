import { Chat } from "../stores/ChatStore"

export const getCurrentChat = (
  chats: Record<string, Chat>,
  chatId: string | undefined
): Chat | undefined => {
  if (!chatId) return undefined

  return chats[chatId]
}

export const getHost = (
  chats: Record<string, Chat>,
  chatId: string | undefined
): string | undefined => {
  return getCurrentChat(chats, chatId)
    ?.chatSettings
    ?.host
}

export const getSelectedModel = (
  chats: Record<string, Chat>,
  chatId: string | undefined
): string | undefined => {
  return getCurrentChat(chats, chatId)
    ?.chatSettings
    ?.model
}
