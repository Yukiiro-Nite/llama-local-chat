export type ChatRoleType = 'user' | 'assistant' | 'system'

export const ChatRoles: Record<ChatRoleType, ChatRoleType> = {
  user: 'user',
  assistant: 'assistant',
  system: 'system'
}

export type CapabilityType = 'completion' | 'vision' | 'tools'

export const Capabilities: Record<CapabilityType, CapabilityType> = {
  completion: 'completion',
  vision: 'vision',
  tools: 'tools',
}

export interface ChatHistoryMessage {
  role: ChatRoleType
  content: string
}

export interface ChatResponse {
  model: string
  created_at: string
  message: ChatHistoryMessage
  done: true
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
}

export interface ModelDetails {
  parent_model?: string
  format: string
  family: string
  families?: string[]
  parameter_size: string
  quantization_level: string
}

export interface ModelShortData {
  name: string
  modified_at: string
  size: number
  digest: string
  details: ModelDetails
}

export interface ModelInfo {
  "general.architecture": string
  "general.file_type": number
  "general.parameter_count": number
  "general.quantization_version": number
  "llama.attention.head_count": number
  "llama.attention.head_count_kv": number
  "llama.attention.layer_norm_rms_epsilon": number
  "llama.block_count": number
  "llama.context_length": number
  "llama.embedding_length": number
  "llama.feed_forward_length": number
  "llama.rope.dimension_count": number
  "llama.rope.freq_base": number
  "llama.vocab_size": number
  "tokenizer.ggml.bos_token_id": number
  "tokenizer.ggml.eos_token_id": number
  "tokenizer.ggml.model": string
  "tokenizer.ggml.pre": string
}

export interface ModelLongData {
  modelfile: string
  parameters: string
  template: string
  details: ModelDetails
  model_info: ModelInfo
  capabilities: string[]
}

export interface ModelsResponse {
  models: ModelShortData[]
}

