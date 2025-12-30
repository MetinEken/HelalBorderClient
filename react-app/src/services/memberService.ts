import axios from '../lib/axios'

export interface Member {
  id: string | number
  name?: string
  email?: string
  username?: string
  userCode?: number
  targetLanguage?: string | null
  nativeLanguage?: string | null
  platform?: string | null
  active?: boolean
  memberType?: string
  createdAt?: string
  updatedAt?: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  limit: number
  total?: number
  hasNext?: boolean
}

export async function listMembers(page = 1, limit = 20): Promise<PagedResult<Member>> {
  const { data } = await axios.get('/users', { params: { page, limit } })
  const payload: any = data

  const items: Member[] = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.items) ? payload.items
      : (Array.isArray(payload?.data) ? payload.data
        : (Array.isArray(payload?.rows) ? payload.rows : [])))

  const total = typeof payload?.total === 'number'
    ? payload.total
    : (typeof payload?.count === 'number' ? payload.count : undefined)

  const hasNext = typeof payload?.hasNext === 'boolean'
    ? payload.hasNext
    : (total != null ? (page * limit < total) : (items.length === limit))

  return { items, page, limit, total, hasNext }
}
