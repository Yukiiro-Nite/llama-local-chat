import classNames from "classnames"
import { ChangeEvent, useCallback } from "react"
import { HostModels, ModelData, useModelStore } from "../../stores/ModelStore"
import './ModelSelect.css'

export interface ModelSelectProps {
  modelSetting: string | undefined
  hostSetting: string | undefined
  setModel: (model: string) => void
}

const notLoaded = { loading: false, loaded: false }

export const ModelSelect = (props: ModelSelectProps) => {
  const {
    modelSetting,
    hostSetting,
    setModel
  } = props
  const modelState = useModelStore()
  const hostModels = hostSetting
    ? modelState.modelsByHost[hostSetting]
    : notLoaded as HostModels
  const currentModel = (hostSetting && modelSetting)
    ? hostModels.models?.[modelSetting] ?? notLoaded as ModelData
    : notLoaded as ModelData

  const _setModel = useCallback((event: ChangeEvent) => {
    const value = (event.target as HTMLSelectElement).value
    setModel(value)
  }, [setModel])

  const refreshModels = useCallback(() => {
    modelState.reloadModels()
  }, [modelState])

  return (
    <label className="ModelSelect" htmlFor="model">
      <span>Model</span>
      <div className="SelectWrapper">
        <select
          name="model"
          value={modelSetting}
          onChange={_setModel}
        >
          {
            Object.values(hostModels.models ?? {})?.map((model) => {
              return (
                <option
                  key={model.short.name}
                  value={model.short.name}
                >
                  {model.short.name}
                </option>
              )
            })
          }
        </select>
        <button
          className="RefreshButton"
          type="button"
          onClick={refreshModels}
        >🔁</button>
      </div>
      <dl className="ModelDetails">
        <dd className={classNames('LoadingIndicator', {show: currentModel.loading})}>Loading</dd>
        <dt>Capabilities:</dt>
        <dd>{currentModel?.long?.capabilities?.join(', ')}</dd>
      </dl>
    </label>
  )
}