import axios from '../lib/axios'

export interface YoutubeCharacter {
  name: string
  role: string
  gender: string
  voiceId: string
  voiceName: string
  languageCode: string
  speakingStyle: string
  characterVideoUrl?: string
}

export interface CreateYoutubeDto {
  youtubeUrl: string
  awsUrl?: string | null
  baseStoryId?: string | null
  title: string
  story?: string | null
  baseInstruction?: string | null
  characters?: YoutubeCharacter[] | null
  type?: string | null
  videoId?: string | null
  videoType?: string | null
  languageId?: number | null
  assistantId?: string | null
  basePromt?: string | null
  coverImageUrl?: string | null
  characterIdleVideoUrl?: string | null
  characterTalkingVideoUrl?: string | null
  aiCharacterId?: string | null
  baseInstructionEntityId?: string | null
  isChatOpen?: boolean
  active?: boolean
  chatMode?: 'single' | 'multi'
  youtubeCharacters?: Array<{ aiCharacterId: string; isPrimary?: boolean; orderIndex?: number }>
}

export interface YoutubeItem extends CreateYoutubeDto {
  id: string
  createdAt?: string
  updatedAt?: string
  language?: any
  aiCharacterId?: string | null
  baseInstructionEntityId?: string | null
  aiCharacter?: any
  baseInstructionEntity?: any
}

const base = '/youtube'

export async function list(): Promise<YoutubeItem[]> {
  const { data } = await axios.get(base)
  return data
}

export async function listByRelations(params: { aiCharacterId?: string; baseInstructionEntityId?: string }): Promise<YoutubeItem[]> {
  const { data } = await axios.get(`${base}/by-relations`, { params })
  return data
}

export async function search(params: Record<string, any>): Promise<YoutubeItem[]> {
  const { data } = await axios.get(`${base}/list/search`, { params })
  return data
}

export async function getOne(id: string): Promise<YoutubeItem> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function create(dto: CreateYoutubeDto): Promise<YoutubeItem> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function update(id: string, dto: Partial<CreateYoutubeDto>): Promise<YoutubeItem> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function remove(id: string): Promise<{ success: boolean } | any> {
  const { data } = await axios.delete(`${base}/${id}`)
  return data
}
