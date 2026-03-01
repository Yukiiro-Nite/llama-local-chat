import { Client } from '@modelcontextprotocol/sdk/client'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

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