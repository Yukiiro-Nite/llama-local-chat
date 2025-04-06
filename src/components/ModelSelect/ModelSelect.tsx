import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { ModelShortData } from "../../api/llama.types"
import { getModels } from "../../api/llama"

export interface ModelSelectProps {
  modelSetting: string | undefined
  hostSetting: string | undefined
  setModel: (model: string) => void
}

interface RequestState<T> {
  loading: boolean
  error?: string
  data?: T
}

export const ModelSelect = (props: ModelSelectProps) => {
  const {
    modelSetting,
    hostSetting,
    setModel
  } = props
  const [modelsRequestState, setModelsRequestState] = useState<RequestState<ModelShortData[]>>({ loading: false })

  const _getModels = useCallback(() => {
    if (!hostSetting) {
      return
    }
    setModelsRequestState({loading: true})
    getModels(hostSetting)
      .then((modelsResponse) => {
        setModelsRequestState({
          loading: false,
          data: modelsResponse.models
        })
      })
      .catch(async (response: Response) => {
        setModelsRequestState({
          loading: false,
          error: await response.text()
        })
      })
  }, [hostSetting])

  const _setModel = useCallback((event: ChangeEvent) => {
    const value = (event.target as HTMLSelectElement).value
    setModel(value)
  }, [])

  useEffect(() => {
    const modelsNeedUpdate = !modelsRequestState.loading
      && !modelsRequestState.data
      && !modelsRequestState.error
    if (modelsNeedUpdate) {
      _getModels()
    }
  }, [_getModels, modelsRequestState.data, modelsRequestState.error, modelsRequestState.loading])

  return (
    <label>
      <span>Model</span>
      <select
        name="model"
        value={modelSetting}
        onChange={_setModel}
      >
        {
          modelsRequestState.data?.map((model) => {
            return (
              <option key={model.name} value={model.name}>{model.name}</option>
            )
          })
        }
      </select>
    </label>
  )
}