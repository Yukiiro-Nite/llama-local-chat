import classNames from "classnames"
import { Capabilities } from "../../api/llama.types"
import { useChatStore } from "../../stores/ChatStore"
import { useModelStore } from "../../stores/ModelStore"
import { getHost, getSelectedModel } from "../../utils/chatUtils"
import { getModelCapabilities } from "../../utils/modelUtils"
import "./MCPInput.css"

export interface MCPInputProps {
  useMcp?: boolean
  mcpHost?: string
}

export const MCPInput = (props: MCPInputProps) => {
  const {
    useMcp,
    mcpHost
  } = props
  const chats = useChatStore(chatState => chatState.chats)
  const currentChatId = useChatStore(chatState => chatState.currentChatId)
  const modelsByHost = useModelStore(modelState => modelState.modelsByHost)
  const host = getHost(chats, currentChatId)
  const selectedModel = getSelectedModel(chats, currentChatId)
  const capabilities = getModelCapabilities(modelsByHost, host, selectedModel)
  const MCPInputClasses = classNames('MCPInput', { hide: !capabilities.includes(Capabilities.tools)})

  return (
    <div className={MCPInputClasses}>
      <label>
        <span>Enable MCP Server</span>
        <input
          type="checkbox"
          name="useMcp"
          defaultChecked={useMcp}
        />
      </label>
      <label>
        <span>MCP Host</span>
        <input
          name="mcpHost"
          defaultValue={mcpHost}
        ></input>
      </label>
    </div>
  )
}