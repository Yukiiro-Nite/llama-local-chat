import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { ToolStore } from "../stores/ToolStore"
import { useChatStore } from "../stores/ChatStore"
import { getTools } from '../api/mcpClient'

export const needsLoadingAfterHydrate = (state: ToolStore): boolean => {
  if (Object.values(state.toolsByHost).length === 0) return true
  return Object.values(state.toolsByHost).some(hostTool => !hostTool.loaded)
}

export const loadTools = async (state: ToolStore) => {
  const { chats } = useChatStore.getState()
  const {
    toolsByHost,
    setHostLoaded,
    setHostLoading,
    setTools,
    setHostError
  } = state
  // Get a list of hosts from the current chats
  const uniqueHosts = Array.from(new Set(Object.values(chats)
    .filter(chat => chat.chatSettings.useMcp)
    .map(chat => chat.chatSettings.mcpHost)
  ))
  const mcpToolsToLoad = uniqueHosts.filter(mcpHost => {
    const hostTools = toolsByHost[mcpHost]
    return !hostTools
      || !hostTools.loaded
  })

  await Promise.all(mcpToolsToLoad.map(async (mcpHost) => {
    setHostLoading(mcpHost, true)
    let toolsResponse: Tool[] | undefined
    try {
      toolsResponse = await getTools(mcpHost)
    } catch (error) {
      console.error("Problem loading tools: ", error)
      setHostError(mcpHost, "Problem loading tools")
    } finally {
      setHostLoading(mcpHost, false)
      setHostLoaded(mcpHost, true)
    }

    if (!toolsResponse) return

    setTools(mcpHost, toolsResponse)
  }))
}