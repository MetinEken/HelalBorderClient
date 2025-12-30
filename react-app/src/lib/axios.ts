import Axios from 'axios'

const baseURL = (import.meta.env.VITE_BASE_API_URL as string | undefined)
  || (import.meta.env.VITE_BASE_URL as string | undefined)
  || ''

const axios = Axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// İstenirse auth header ekleme (şimdilik pasif)
axios.interceptors.request.use((config) => {
  const stored = localStorage.getItem('systemDefault')
  const envToken = (import.meta.env.VITE_AUTH_TOKEN as string | undefined)
  const token = stored || envToken
  if (token) {
    config.headers = config.headers || {}
    const headersAny: any = config.headers as any
    if (typeof headersAny.set === 'function') headersAny.set('Authorization', `Bearer ${token}`)
    else headersAny.Authorization = `Bearer ${token}`
  }
  return config
})

export default axios
