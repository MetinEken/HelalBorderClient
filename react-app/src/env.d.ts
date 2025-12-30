/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL?: string
  readonly VITE_BASE_URL: string
  readonly VITE_LOGIN_PASSWORD: string
  readonly VITE_AUTH_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
