export interface ToolCallResponseTextContent {
  type: 'text',
  text: string
}

export interface SimplifiedToolCallResponse {
  id: string
  tool_name: string
  content: string
}