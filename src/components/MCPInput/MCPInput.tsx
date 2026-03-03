import classNames from "classnames"
import { Capabilities } from "../../api/llama.types"
import { useChatStore } from "../../stores/ChatStore"
import { useModelStore } from "../../stores/ModelStore"
import { getHost, getSelectedModel } from "../../utils/chatUtils"
import { getModelCapabilities } from "../../utils/modelUtils"
import "./MCPInput.css"
import { useToolStore } from "../../stores/ToolStore"

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
  const reloadTools = useToolStore(toolState => toolState.reloadTools)
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
        <div>
          <input
            name="mcpHost"
            defaultValue={mcpHost}
          ></input>
          <button
            className="RefreshButton"
            type="button"
            onClick={reloadTools}
          >🔁</button>
        </div>
      </label>
    </div>
  )
}