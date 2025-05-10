import { getModel, getModels } from "../api/llama"
import { ModelLongData, ModelsResponse } from "../api/llama.types"
import { defaultChatSettings, useChatStore } from "../stores/ChatStore"
import { ModelStore } from "../stores/ModelStore"

export const needsLoadingAfterHydrate = (state: ModelStore): boolean => {
  if (Object.values(state.modelsByHost).length === 0) return true
  return Object.values(state.modelsByHost).some(hostModel => {
    if (hostModel.loaded) return false

    return Object.values(hostModel.models ?? {})
      .some(model => !model.loaded)
  })
}

export const needsLoadingAfterStateChange = (state: ModelStore): boolean => {
  if (Object(state.modelsByHost).length === 0) return true
  return Object.values(state.modelsByHost).some(hostModel => {
    if (hostModel.loaded || hostModel.loading) return false

    return Object.values(hostModel.models ?? {})
      .some(model => !model.loaded && !model.loading)
  })
}

export const loadModels = async (state: ModelStore) => {
  const { chats } = useChatStore.getState()
  const {
    modelsByHost,
    setHostLoaded,
    setHostLoading,
    setModel,
    setHostError
  } = state
  // Get a list of hosts from the current chats
  const uniqueHosts = Array.from(new Set(Object.values(chats)
    .map(chat => chat.chatSettings.host)
  ))

  if (uniqueHosts.length === 0) {
    uniqueHosts.push(defaultChatSettings.host)
  }

  // Get a list of the hosts we need to load
  const hostsToLoad = uniqueHosts.filter(host => {
    const hostModels = modelsByHost[host]
    return !hostModels
      || !hostModels.loaded
  })

  // Get a list of available models for each host
  const hostModels = await Promise.all(hostsToLoad.map(async (host) => {
    setHostLoading(host, true)
    let modelsResponse: ModelsResponse | undefined
    try {
      modelsResponse = await getModels(host)
    } catch (error) {
      const response = error as Response
      const errorText = await response.text()
      setHostError(host, errorText)
    } finally {
      setHostLoading(host, false)
      setHostLoaded(host, true)
    }

    if (!modelsResponse) {
      return []
    }

    return modelsResponse.models.map(model => {
      setModel(host, { short: model, loaded: false, loading: false })
      return {
        host,
        model
      }
    })
  }))

  // Get a list of the individual models we need to load
  // TODO: Also check loaded host models, it's possible that we got the list, but didn't load the details
  const hostModelsToLoad = hostModels.flat().filter((hostModel) => {
    const modelName = hostModel.model.name
    const currentModel = modelsByHost?.[hostModel.host]?.models?.[modelName] ?? { loaded: false }
    return !currentModel ||
      !currentModel.loaded
  })

  // Make requests to load the details for every unloaded model
  await Promise.all(hostModelsToLoad.map(async (hostModel) => {
    const modelName = hostModel.model.name
    setModel(hostModel.host, {
      short: hostModel.model,
      loaded: false,
      loading: true
    })
    let modelDetailResponse: ModelLongData | undefined
    try {
      modelDetailResponse = await getModel(hostModel.host, modelName)
    } catch (error) {
      const response = error as Response
      const errorText = await response.text()
      setModel(hostModel.host, {
        short: hostModel.model,
        loaded: true,
        loading: false,
        error: errorText
      })
    }

    if (!modelDetailResponse) return

    setModel(hostModel.host, {
      short: hostModel.model,
      long: modelDetailResponse,
      loaded: true,
      loading: false,
    })
  }))
}