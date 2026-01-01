import axios from '../lib/axios'

export interface BaseInstruction {
  id: string
  name: string | null
  code: string
  description: string | null
  baseInstruction: string
  maxReplySentences: number | null
  enableCorrection: boolean
  allowFollowup: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateBaseInstructionDto {
  name: string
  code: string
  description: string
  baseInstruction: string
  maxReplySentences?: number | null
  enableCorrection?: boolean
  allowFollowup?: boolean
}

export interface UpdateBaseInstructionDto {
  name?: string
  code?: string
  description?: string
  baseInstruction?: string
  maxReplySentences?: number | null
  enableCorrection?: boolean
  allowFollowup?: boolean
}

const base = '/base-instruction'

export async function listBaseInstructions(): Promise<BaseInstruction[]> {
  const { data } = await axios.get(base)
  return Array.isArray(data) ? data : []
}

export async function getBaseInstruction(id: string): Promise<BaseInstruction> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function createBaseInstruction(dto: CreateBaseInstructionDto): Promise<BaseInstruction> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function updateBaseInstruction(id: string, dto: UpdateBaseInstructionDto): Promise<BaseInstruction> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function deleteBaseInstruction(id: string): Promise<any> {
  const { data } = await axios.delete(`${base}/${id}`)
  return data
}
