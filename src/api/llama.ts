import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { ChatHistoryMessage, ChatResponse, ModelLongData, ModelsResponse } from "./llama.types"
import { mcpToLlamaTool } from "../utils/toolUtils"

export const getChat = async (
  host: string,
  model: string,
  history: ChatHistoryMessage[],
  tools?: Tool[]
): Promise<ChatResponse> => {
  const path = `${host}/api/chat`
  const reqBody: Record<string, any> = {
    model: model,
    stream: false,
    messages: history
  }

  if (tools && tools.length > 0) {
    reqBody.tools = tools.map(mcpToLlamaTool)
  }

  const response = await fetch(
    path,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(reqBody)
    }
  )

  if (response.status !== 200) {
    throw response
  }

  const rawData = await response.json() as ChatResponse

  return rawData
}

export const getModels = async (
  host: string
): Promise<ModelsResponse> => {
  const path = `${host}/api/tags`
  const response = await fetch(
    path,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  )

  if (response.status !== 200) {
    throw response
  }

  return (await response.json()) as ModelsResponse
}

export const getModel = async (
  host: string,
  model: string
): Promise<ModelLongData> => {
  const path = `${host}/api/show`
  const response = await fetch(
    path,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model
      })
    }
  )

  if (response.status !== 200) {
    throw response
  }

  return (await response.json()) as ModelLongData
}