import axios from '../lib/axios'

export interface Language {
  id: number
  name: string
  code: string
  isActive: boolean
  nativeName: string | null
  direction: 'ltr' | 'rtl'
  createdAt: string
  updatedAt: string
}

export async function listLanguages(): Promise<Language[]> {
  const { data } = await axios.get('/languages')
  const payload: any = data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.data)) return payload.data
  if (payload && Array.isArray(payload.rows)) return payload.rows
  return []
}
