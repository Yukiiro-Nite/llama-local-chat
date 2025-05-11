import classNames from "classnames"
import { Capabilities } from "../../api/llama.types"
import { useChatStore } from "../../stores/ChatStore"
import { useModelStore } from "../../stores/ModelStore"
import { getHost, getSelectedModel } from "../../utils/chatUtils"
import { getModelCapabilities } from "../../utils/modelUtils"
import "./FileInput.css"

export const FileInput = () => {
  const chats = useChatStore(chatState => chatState.chats)
  const currentChatId = useChatStore(chatState => chatState.currentChatId)
  const modelsByHost = useModelStore(modelState => modelState.modelsByHost)
  const host = getHost(chats, currentChatId)
  const selectedModel = getSelectedModel(chats, currentChatId)
  const capabilities = getModelCapabilities(modelsByHost, host, selectedModel)
  const fileInputClasses = classNames('FileInput', { hide: !capabilities.includes(Capabilities.vision)})

  return (
    <label className={fileInputClasses}>
      <span>Images</span>
      <input
        type="file"
        name="files"
        accept="image/*"
      ></input>
    </label>
  )
}