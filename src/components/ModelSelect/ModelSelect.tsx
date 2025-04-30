import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { ModelLongData, ModelShortData } from "../../api/llama.types"
import { getModel, getModels } from "../../api/llama"
import classNames from "classnames"
import './ModelSelect.css'

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
  const [modelInfoRequestState, setModelInfoRequestState] = useState<Record<string,RequestState<ModelLongData>>>({})
  const currentModelInfo = useMemo(() => {
    const defaultState = {loading:true} as RequestState<ModelLongData>
    if (!modelSetting) return defaultState
    return modelInfoRequestState[modelSetting] ?? defaultState
  }, [modelInfoRequestState, modelSetting])

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
  }, [setModel])

  useEffect(() => {
    const modelsNeedUpdate = !modelsRequestState.loading
      && !modelsRequestState.data
      && !modelsRequestState.error
    if (modelsNeedUpdate) {
      _getModels()
    }
  }, [_getModels, modelsRequestState.data, modelsRequestState.error, modelsRequestState.loading])

  useEffect(() => {
    // When the current model changes
    // Check if model data for it exists
    // If not, make a request to load it
    if (!modelSetting || !hostSetting) return

    const currentModelRequestState = modelInfoRequestState[modelSetting]
    // Don't retry on error, it'll spam requests...
    // Instead I need to build a refresh / retry button
    if (currentModelRequestState) return

    setModelInfoRequestState({
      ...modelInfoRequestState,
      [modelSetting]: {
        loading: true
      }
    })

    getModel(hostSetting, modelSetting)
      .then((modelInfo) => {
        setModelInfoRequestState({
          ...modelInfoRequestState,
          [modelSetting]: {
            loading: false,
            data: modelInfo
          }
        })
      })
      .catch(async (response: Response) => {
        setModelInfoRequestState({
          ...modelInfoRequestState,
          [modelSetting]: {
            loading: false,
            error: await response.text()
          }
        })
      })
  }, [hostSetting, modelInfoRequestState, modelSetting])

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
      <dl>
        <dd className={classNames('LoadingIndicator', {show: currentModelInfo.loading})}>Loading</dd>
        <dt>Capabilities:</dt>
        <dd>{currentModelInfo?.data?.capabilities?.join(', ')}</dd>
      </dl>
    </label>
  )
}