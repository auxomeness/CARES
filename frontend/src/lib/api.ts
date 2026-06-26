import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'cares.accessToken'

export type ApiErrorPayload = {
  success: false
  message: string
  errors: Array<{ message?: string; path?: Array<string | number> } | string>
}

export class ApiError extends Error {
  status: number
  errors: ApiErrorPayload['errors']

  constructor(message: string, status = 500, errors: ApiErrorPayload['errors'] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status ?? 0
    const payload = error.response?.data

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('cares:unauthorized'))
    }

    return Promise.reject(
      new ApiError(
        payload?.message ?? (status === 0 ? 'Unable to reach the CARES API.' : 'Request failed.'),
        status,
        payload?.errors ?? [],
      ),
    )
  },
)

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const firstError = error.errors[0]
    if (typeof firstError === 'string') return firstError
    return firstError?.message ?? error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}
