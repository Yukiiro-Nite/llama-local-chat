import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { ChatRoleType } from '../api/llama.types'
import { loadModels } from '../utils/modelUtils'
import { useModelStore } from './ModelStore'

export interface ChatMessage {
  role: ChatRoleType
  content: string
  createdAt: string
}

export interface ChatSettingsData {
  title: string
  host: string
  model: string
  systemMessage: string
  historyLength: number
}

export const defaultChatSettings: ChatSettingsData = {
  title: 'New Chat',
  host: 'http://localhost:11434',
  model: 'llama3.1:latest',
  systemMessage: '',
  historyLength: 10
}

export interface Chat {
  id: string
  createdAt: string
  updatedAt: string
  chatHistory: ChatMessage[]
  chatSettings: ChatSettingsData
}

export interface ChatStore {
  chats: Record<string, Chat>
  currentChatId?: string
  setCurrentChatId: (id: string) => void
  createNewChat: () => Chat
  appendChatHistory: (id: string, message: ChatMessage) => ChatMessage[]
  clearChatHistory: (id: string) => void
  updateChatSettings: (id: string, settings: Partial<ChatSettingsData>) => void
  deleteChat: (id: string) => void
}

export const useChatStore = create<ChatStore>()(subscribeWithSelector(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: undefined,
      setCurrentChatId: (id) => set({ currentChatId: id }),
      createNewChat: () => {
        const state = get()
        const nowStr = new Date().toISOString()
        const newChat: Chat = {
          id: crypto.randomUUID(),
          createdAt: nowStr,
          updatedAt: nowStr,
          chatHistory: [],
          chatSettings: {...defaultChatSettings}
        }

        set({
          ...state,
          chats: {
            ...state.chats,
            [newChat.id]: newChat
          }
        })

        return newChat
      },
      appendChatHistory: (id, message) => {
        const state = get()
        const nowStr = new Date().toISOString()
        const chatToUpdate = state.chats[id]
        if (!chatToUpdate) {
          console.error('Chat with id does not exist: ', id)
          return []
        }

        const newHistory = chatToUpdate.chatHistory.concat(message)

        set({
          ...state,
          chats: {
            ...state.chats,
            [id]: {
              ...chatToUpdate,
              updatedAt: nowStr,
              chatHistory: newHistory
            }
          }
        })

        return newHistory
      },
      clearChatHistory: (id) => {
        const state = get()
        const nowStr = new Date().toISOString()
        const chatToUpdate = state.chats[id]
        if (!chatToUpdate) {
          console.error('Chat with id does not exist: ', id)
          return []
        }

        set({
          ...state,
          chats: {
            ...state.chats,
            [id]: {
              ...chatToUpdate,
              updatedAt: nowStr,
              chatHistory: []
            }
          }
        })
      },
      updateChatSettings: (id, settings) => {
        const state = get()
        const nowStr = new Date().toISOString()
        const chatToUpdate = state.chats[id]
        if (!chatToUpdate) {
          console.error('Chat with id does not exist: ', id)
          return
        }

        set({
          ...state,
          chats: {
            ...state.chats,
            [id]: {
              ...chatToUpdate,
              updatedAt: nowStr,
              chatSettings: {
                ...chatToUpdate.chatSettings,
                ...settings
              }
            }
          }
        })
      },
      deleteChat: (id) => {
        const state = get()
        const { [id]: chatToRemove, ...chats } = state.chats
        console.warn('Removing chat: ', chatToRemove)

        set({
          ...state,
          currentChatId: id === state.currentChatId
            ? undefined
            : state.currentChatId,
          chats
        })
      }
    }),
    {
      name: 'llama-chat_ChatStore'
    }
  )
))

useChatStore.subscribe(
  (state) => {return state.chats},
  (
    currentChats,
    prevChats
  ) => {
    const hasUpdatedHost = Object.entries(currentChats).some(([id, chat]) => {
      const prevChat = prevChats[id]
      if (!prevChat) return true
      if (prevChat.chatSettings.host !== chat.chatSettings.host) return true

      return false
    })

    if (hasUpdatedHost) {
      loadModels(useModelStore.getState())
    }
  }
)