import axios from '../lib/axios'

export interface AwsVideosImageItem {
  id: string
  name: string
  awsVideoUrl: string | null
  coverImageUrl?: string | null
  awsVideoKey?: string | null
  coverImageKey?: string | null
  videoUrl?: string | null
  coverUrl?: string | null
  videoType: string
  languageId?: number | null
  language?: any
  active?: boolean
  uploadStatus?: string
  errorMessage?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateAwsVideosImageDto {
  name: string
  awsVideoUrl?: string | null
  coverImageUrl?: string | null
  videoType: string
  languageId?: number | null
  active?: boolean
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

const base = '/aws-videos-image'

export async function list(): Promise<AwsVideosImageItem[]> {
  const { data } = await axios.get(base)
  return data
}

export async function search(params: Partial<{ page: number; pageSize: number; search: string; videoType: string; languageId: number; active: boolean }>): Promise<PagedResult<AwsVideosImageItem>> {
  const { data } = await axios.get(`${base}/list/search`, { params })
  return data
}

export async function getOne(id: string): Promise<AwsVideosImageItem> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function create(dto: CreateAwsVideosImageDto): Promise<AwsVideosImageItem> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function update(id: string, dto: CreateAwsVideosImageDto): Promise<AwsVideosImageItem> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function remove(id: string): Promise<void> {
  await axios.delete(`${base}/${id}`)
}

// S3 upload akışı için ek helper'lar

export interface DraftRequest {
  name: string
  videoType: string
  languageId?: number | null
  active?: boolean
  videoExt?: string
  videoContentType?: string
  coverExt?: string
  coverContentType?: string
}

export interface PresignedInfo {
  key: string
  putUrl: string
  finalUrl: string
}

export interface DraftResponse {
  id: string
  video?: PresignedInfo
  cover?: PresignedInfo
}

export async function createDraft(body: DraftRequest): Promise<DraftResponse> {
  const { data } = await axios.post(`${base}/draft`, body)
  return data
}

export async function finalizeUpload(id: string, payload: { videoKey?: string | null; coverKey?: string | null }): Promise<AwsVideosImageItem> {
  const { data } = await axios.patch(`${base}/${id}/finalize`, payload)
  return data
}

export async function markUploadFailed(id: string, errorMessage: string): Promise<AwsVideosImageItem> {
  const { data } = await axios.patch(`${base}/${id}/fail`, { errorMessage })
  return data
}

export interface SignedUrls {
  videoUrl: string | null
  coverUrl: string | null
}

export async function getSignedUrls(id: string, params?: { videoExpires?: number; coverExpires?: number }): Promise<SignedUrls> {
  const { data } = await axios.get(`${base}/${id}/signed-urls`, { params })
  return data
}
