import axios from '../lib/axios'

export interface LoginResponse {
  token: string
}

export interface RegisterAdminResponseDto {
  success: boolean
  message: string
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axios.post('/auth/login', { email, password })
  const payload: any = data
  const token = payload?.token || payload?.accessToken || payload?.jwt
  if (!token || typeof token !== 'string') {
    throw new Error('Token alınamadı')
  }
  return { token }
}

export async function registerApi(name: string, email: string, password: string): Promise<RegisterAdminResponseDto> {
  const { data } = await axios.post('/auth/register', { name, email, password })
  const payload: any = data
  return {
    success: !!payload?.success,
    message: String(payload?.message || ''),
  }
}
