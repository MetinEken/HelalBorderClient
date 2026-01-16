import axios from '../lib/axios'

export type PaketPlatform = 'android' | 'ios'

export type PaketPeriodUnit = 'day' | 'week' | 'month' | 'year'

export interface PaketDto {
  id?: number
  isim: string
  aciklama?: string | null
  sure: number

  // Fiyat alanları opsiyonel
  fiyat?: number | null
  paraBirimi?: string | null

  aktif: boolean
  platform: PaketPlatform

  // Store/product kimlikleri
  googlePlayProductId?: string | null
  appStoreProductId?: string | null

  // Çok dilli isim/açıklama
  nameTr?: string | null
  nameEn?: string | null
  nameDe?: string | null
  descriptionTr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null

  // Google Play katalog alanları
  sku?: string | null
  basePlanId?: string | null
  offerId?: string | null

  packageName?: string | null

  // Kullanım hakları
  allowanceSeconds: number
  carryOverAllowed?: boolean
  maxCarryOverSeconds?: number | null

  // Periyot bilgisi (özellikle iOS için)
  periodUnit?: PaketPeriodUnit | null
  periodCount?: number | null

  // App Store grupları / offer listeleri
  subscriptionGroupId?: string | null
  appStoreOfferIdentifiers?: string | null

  // Store fiyat gösterimi
  storeDisplayPrice?: number | null
  storeCurrencyCode?: string | null

  // Diğer
  discount?: number
  ozellikler?: string | null

  createdAt?: string
  updatedAt?: string
  abonelikSayisi?: number
}

const base = '/subscriptions'

export async function list(): Promise<PaketDto[]> {
  const { data } = await axios.get(base)
  return data
}

export async function getOne(id: number): Promise<PaketDto> {
  const { data } = await axios.get(`${base}/${id}`)
  return data
}

export async function create(dto: PaketDto): Promise<PaketDto> {
  const { data } = await axios.post(base, dto)
  return data
}

export async function update(id: number, dto: Partial<PaketDto>): Promise<PaketDto> {
  const { data } = await axios.patch(`${base}/${id}`, dto)
  return data
}

export async function remove(id: number): Promise<any> {
  const { data } = await axios.delete(`${base}/${id}`)
  return data
}

export async function listByPlatform(platform: string): Promise<PaketDto[]> {
  const { data } = await axios.get(`${base}/platform`, { params: { platform } })
  return data
}
