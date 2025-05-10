import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { ModelLongData, ModelShortData } from '../api/llama.types'
import { loadModels, needsLoadingAfterHydrate, needsLoadingAfterStateChange } from '../utils/modelUtils'

export interface ModelData {
  /** Short data for this model */
  short: ModelShortData
  /** Long data for this model */
  long?: ModelLongData
  /** Whether this model's long data is loading */
  loading: boolean
  /** Whether this model's long data has been loaded, useful for recovering from a page refresh */
  loaded: boolean
  /** Error data from attempting to load this model's long data */
  error?: string
}

export interface HostModels {
  /** Models for this host, by name */
  models?: Record<string, ModelData>
  /** Whether the models are loading */
  loading: boolean
  /** Whether the models have been loaded, useful for recovering from page refresh */
  loaded: boolean
  /** Error data from attempting to load models */
  error?: string
}

export interface ModelStore {
  /** Models by host name, by model name */
  modelsByHost: Record<string, HostModels>
  /** Used to set error when loading models */
  setHostError: (host: string, error: string) => void
  /** Used to set model data */
  setModel: (host: string, model: ModelData) => void
  /** Used to clear the current models */
  reloadModels: () => void
  /** Used to set the loading state for the models */
  setHostLoading: (host: string, loading: boolean) => void
  /** Used to set the loaded state for the models */
  setHostLoaded: (host: string, loaded: boolean) => void
}

export const useModelStore = create<ModelStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        modelsByHost: {},
        setHostError: (host, error) => {
          const state = get()
          set({
            modelsByHost: {
              ...state.modelsByHost,
              [host]: {
                ...state.modelsByHost[host],
                error
              }
            }
          })
        },
        setModel: (host, model) => {
          const state = get()
          set({
            modelsByHost: {
              ...state.modelsByHost,
              [host]: {
                ...state.modelsByHost[host],
                models: {
                  ...state.modelsByHost[host]?.models,
                  [model.short.name]: model
                }
              }
            }
          })
        },
        reloadModels: () => {
          set({
            modelsByHost: {} as Record<string, HostModels>
          })
        },
        setHostLoading: (host, loading) => {
          const state = get()
          set({
            modelsByHost: {
              ...state.modelsByHost,
              [host]: {
                ...state.modelsByHost[host],
                loading
              }
            }
          })
        },
        setHostLoaded: (host, loaded) => {
          const state = get()
          set({
            modelsByHost: {
              ...state.modelsByHost,
              [host]: {
                ...state.modelsByHost[host],
                loaded
              }
            }
          })
        },
      }),
      {
        name: 'llama-chat_ModelStore',
        onRehydrateStorage: () => (state, error) => {
          if (error || !state) {
            console.error('Problem loading ModelStore: ', error)
            return
          }

          if (needsLoadingAfterHydrate(state)) {
            loadModels(state)
          }
        }
      }
    )
  )
)

useModelStore.subscribe((state) => {
  if (needsLoadingAfterStateChange(state)) {
    loadModels(state)
  }
})
