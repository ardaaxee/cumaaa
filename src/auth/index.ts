import { LocalAuthProvider } from './localProvider'
import { RemoteAuthProvider } from './remoteProvider'
import type { AuthProvider } from './types'

// Chooses the provider from configuration. Setting VITE_AUTH_PROVIDER_URL is
// the ONLY switch needed to go from the local demo to a real backend — no code
// in the app branches on which one is active; it reads capabilities() instead.
let provider: AuthProvider | null = null

export function authProvider(): AuthProvider {
  if (provider) return provider
  const url = (import.meta.env.VITE_AUTH_PROVIDER_URL as string | undefined)?.trim()
  const googleId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || null
  provider = url ? new RemoteAuthProvider(url, googleId) : new LocalAuthProvider()
  return provider
}

export * from './types'
