import axios from '../lib/axios'

export interface AICharacter {
  id: string
  name: string
  personality: string
  tone: string
  voiceId?: string | null
  voiceIdName?: string | null
  biografi?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateAICharacterDto {
  name: string
  personality: string
  tone: string
  voiceId?: string
  voiceIdName?: string
  biografi?: string
}

export interface UpdateAICharacterDto {
  name?: string
  personality?: string
  tone?: string
  voiceId?: string
  voiceIdName?: string
  biografi?: string
}

const base = '/ai-characters'

export async function listAICharacters(): Promise<AICharacter[]> {
  const { data } = await axios.get(base)
  return Array.isArray(data) ? data : []
}

export async function getAICharacter(id: string): Promise<AICharacter> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function createAICharacter(dto: CreateAICharacterDto): Promise<AICharacter> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function updateAICharacter(id: string, dto: UpdateAICharacterDto): Promise<AICharacter> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function deleteAICharacter(id: string): Promise<any> {
  const { data } = await axios.delete(`${base}/${id}`)
  return data
}
