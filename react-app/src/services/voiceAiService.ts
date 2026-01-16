import axios from '../lib/axios'

export interface VoiceAiConfig {
  aiProvider: string
  llmModel: string
  ttsProvider: string
  allowedLlmModels: string[]
  allowedTtsProviders: string[]
}

export async function getVoiceAiConfig(): Promise<VoiceAiConfig> {
  const { data } = await axios.get<VoiceAiConfig>('/voice-ai/config')
  return data
}

export async function setTtsProvider(provider: string): Promise<VoiceAiConfig> {
  const { data } = await axios.post<{ success: boolean; current: VoiceAiConfig }>(
    '/voice-ai/config/tts',
    { provider },
  )
  return data.current
}

export async function setLlmModel(model: string): Promise<VoiceAiConfig> {
  const { data } = await axios.post<{ success: boolean; current: VoiceAiConfig }>(
    '/voice-ai/config/llm',
    { model },
  )
  return data.current
}
