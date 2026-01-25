import axios from '../lib/axios'

const API_BASE = ''  // axios instance zaten baseURL kullanıyor

export interface TokenRateConfig {
  id: number
  provider: string
  operation: string
  rate: number
  unit: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTokenRateDto {
  provider: string
  operation: string
  rate: number
  unit: string
  description?: string
  isActive?: boolean
}

export interface UpdateTokenRateDto {
  provider?: string
  operation?: string
  rate?: number
  unit?: string
  description?: string
  isActive?: boolean
}

export interface CacheStatus {
  info: {
    lastUpdate: string
    entryCount: number
  }
  rates: Record<string, number>
}

/**
 * Tüm token rate config'leri getir
 */
export async function getAllTokenRates(): Promise<TokenRateConfig[]> {
  const response = await axios.get(`${API_BASE}/deutsch-ai/token-rates`)
  return response.data
}

/**
 * ID ile token rate config getir
 */
export async function getTokenRateById(id: number): Promise<TokenRateConfig> {
  const response = await axios.get(`${API_BASE}/deutsch-ai/token-rates/${id}`)
  return response.data
}

/**
 * Yeni token rate config oluştur
 */
export async function createTokenRate(dto: CreateTokenRateDto): Promise<TokenRateConfig> {
  const response = await axios.post(`${API_BASE}/deutsch-ai/token-rates`, dto)
  return response.data
}

/**
 * Token rate config güncelle
 */
export async function updateTokenRate(id: number, dto: UpdateTokenRateDto): Promise<TokenRateConfig> {
  const response = await axios.put(`${API_BASE}/deutsch-ai/token-rates/${id}`, dto)
  return response.data
}

/**
 * Token rate config sil
 */
export async function deleteTokenRate(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/deutsch-ai/token-rates/${id}`)
}

/**
 * Cache durumunu getir
 */
export async function getCacheStatus(): Promise<CacheStatus> {
  const response = await axios.get(`${API_BASE}/deutsch-ai/token-rates/cache/status`)
  return response.data
}
