import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { loadTools, needsLoadingAfterHydrate } from '../utils/toolUtils'

export interface HostTools {
  /** Tools defined by the MCP server */
  tools?: Tool[]
  /** Whether the tools are loading */
  loading: boolean
  /** Whether the tools have been loaded */
  loaded: boolean
  /** Error data from attempting to load tools */
  error?: string
}

export interface ToolStore {
  /** Tools by MCP host name */
  toolsByHost: Record<string, HostTools>
  /** Used to set error when loading tools */
  setHostError: (host: string, error: string) => void
  /** Used to set tool descriptions */
  setTools: (host: string, tools: Tool[]) => void
  /** Used to clear the current tools */
  reloadTools: () => void
  /** Used to set the loading state for the tools */
  setHostLoading: (host: string, loading: boolean) => void
  /** Used to set the loaded state for the tools */
  setHostLoaded: (host: string, loaded: boolean) => void
}

export const useToolStore = create<ToolStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        toolsByHost: {},
        setHostError: (host, error) => {
          const state = get()
          set({
            toolsByHost: {
              ...state.toolsByHost,
              [host]: {
                ...state.toolsByHost[host],
                error
              }
            }
          })
        },
        setTools: (host, tools) => {
          const state = get()
          set({
            toolsByHost: {
              ...state.toolsByHost,
              [host]: {
                ...state.toolsByHost[host],
                tools
              }
            }
          })
        },
        reloadTools: () => {
          set({
            toolsByHost: {} as Record<string, HostTools>
          })
          loadTools(get())
        },
        setHostLoading: (host, loading) => {
          const state = get()
          set({
            toolsByHost: {
              ...state.toolsByHost,
              [host]: {
                ...state.toolsByHost[host],
                loading
              }
            }
          })
        },
        setHostLoaded: (host, loaded) => {
          const state = get()
          set({
            toolsByHost: {
              ...state.toolsByHost,
              [host]: {
                ...state.toolsByHost[host],
                loaded
              }
            }
          })
        },
      }),
      {
        name: 'llama-chat_ToolStore',
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) {
            console.error('Problem loading ModelStore: ', error)
            return
          }

          if (needsLoadingAfterHydrate(state)) {
            loadTools(state)
          }
        }
      }
    )
  )
)