import axios from '../lib/axios'

export interface VersionDto {
  id?: string
  description: string
  lastVersion: number
  minVersion: number
  isMandatory: boolean
  lastUseDateAt?: Date | string | null

  // Platform-specific fields
  androidLastVersion?: number | null
  androidMinVersion?: number | null
  androidIsMandatory?: boolean | null
  androidDescription?: string | null

  iosLastVersion?: number | null
  iosMinVersion?: number | null
  iosIsMandatory?: boolean | null
  iosDescription?: string | null

  createdAt?: string
  updatedAt?: string
}

const base = '/deutsch-ai/version'

export async function list(): Promise<VersionDto[]> {
  const { data } = await axios.get(base)
  return data
}

export async function getOne(id: string): Promise<VersionDto> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function getLastVersion(): Promise<VersionDto> {
  const { data } = await axios.get(`${base}/last/version`)
  return data
}

export async function getPlatformVersion(): Promise<VersionDto> {
  const { data } = await axios.get(`${base}/platform/version`)
  return data
}

export async function create(dto: VersionDto): Promise<VersionDto> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function update(id: string, dto: Partial<VersionDto>): Promise<VersionDto> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function remove(id: string): Promise<any> {
  const { data } = await axios.delete(`${base}/${id}`)
  return data
}
