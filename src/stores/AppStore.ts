import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppViewType = 'startMenu' | 'chatView' | 'chatSettings' | 'loadChat'
export const AppViews: Record<AppViewType, AppViewType> = {
  startMenu: 'startMenu',
  chatView: 'chatView',
  chatSettings: 'chatSettings',
  loadChat: 'loadChat'
}

export interface AppStore {
  view: AppViewType,
  setView: (view: AppViewType) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      view: AppViews.startMenu,
      setView: (view) => set({ view })
    }),
    {
      name: 'llama-chat_AppStore'
    }
  )
)