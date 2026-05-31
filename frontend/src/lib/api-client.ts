import { client } from '../client/client.gen'
import { getAuthState, useAuthStore } from '../stores/auth-store'
import { env } from './env'

client.setConfig({
  baseUrl: env.apiBaseUrl,
})

client.interceptors.request.use((request) => {
  const { accessToken } = getAuthState()

  if (!accessToken) {
    return request
  }

  const headers = new Headers(request.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  return new Request(request, { headers })
})

client.interceptors.response.use((response) => {
  if (response.status === 401) {
    useAuthStore.getState().clearAuth()
  }

  return response
})

export { client }
