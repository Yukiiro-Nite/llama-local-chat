import { Client } from '@modelcontextprotocol/sdk/client'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { ToolCall } from './llama.types'
import { SimplifiedToolCallResponse, ToolCallResponseTextContent } from './mcpClient.types'

export const getTools = async (mcpHost: string): Promise<Tool[]> => {
  const client = new Client({ name: "llama-local-chat", version: "0.0.1" })
  const transport = new StreamableHTTPClientTransport(new URL(mcpHost))
  await client.connect(transport)

  const allTools: Tool[] = []
  let toolCursor: string | undefined
  do {
    const { tools, nextCursor } = await client.listTools({ cursor: toolCursor })
    allTools.push(...tools)
    toolCursor = nextCursor
  } while (toolCursor);

  await transport.terminateSession()
  await client.close()

  return allTools
}

export const callTools = async (mcpHost: string, toolCalls: ToolCall[]): Promise<SimplifiedToolCallResponse[]> => {
  const client = new Client({ name: "llama-local-chat", version: "0.0.1" })
  const transport = new StreamableHTTPClientTransport(new URL(mcpHost))
  await client.connect(transport)

  const results = await Promise.all(toolCalls.map(async (toolCall) => {
    const result = await client.callTool(toolCall.function)
    const textContent = (result.content as ToolCallResponseTextContent[])
      .filter(c => c.type === "text")
      .map(c => c.text)
      .join("\n")


    return {
      id: toolCall.id,
      tool_name: toolCall.function.name,
      content: textContent
    }
  }))

  await transport.terminateSession()
  await client.close()

  return results
}