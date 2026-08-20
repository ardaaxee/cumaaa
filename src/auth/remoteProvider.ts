import {
  AuthError,
  validDisplayName,
  validEmail,
  validPassword,
  type AuthCapabilities,
  type AuthProvider,
  type AuthUser,
  type PasswordCredentials,
  type Session,
} from './types'

// Real backend provider. Active as soon as VITE_AUTH_PROVIDER_URL is set.
//
// The client never holds a secret: the Google flow is a redirect to the
// BACKEND's /auth/google endpoint, which owns the OAuth client secret and the
// code exchange. VITE_GOOGLE_CLIENT_ID is a public identifier and is only sent
// so the backend can pick the right OAuth app.
//
// The access token lives in sessionStorage, not localStorage: it dies with the
// tab and is never persisted to disk alongside long-lived data.

const TOKEN_KEY = 'cuma-auth-token'

interface AuthEndpointUser {
  id?: unknown
  displayName?: unknown
  username?: unknown
  email?: unknown
  avatar?: unknown
  method?: unknown
  createdAt?: unknown
}

interface AuthEndpointResponse {
  user?: AuthEndpointUser
  accessToken?: unknown
  expiresAt?: unknown
}

// The server is another system, not a trusted extension of this one: shape and
// types are checked before anything reaches the app.
function parseUser(raw: AuthEndpointUser | undefined): AuthUser {
  if (!raw || typeof raw !== 'object') throw new AuthError('NETWORK', 'Malformed response from auth server.')
  const id = typeof raw.id === 'string' ? raw.id : null
  const displayName = typeof raw.displayName === 'string' ? validDisplayName(raw.displayName) : null
  if (!id || !displayName) throw new AuthError('NETWORK', 'Auth server returned an incomplete user.')
  const method = raw.method === 'google' || raw.method === 'password' || raw.method === 'guest' ? raw.method : 'password'
  return {
    id: id.slice(0, 64),
    displayName,
    username: typeof raw.username === 'string' ? raw.username.slice(0, 20) : displayName.toLowerCase(),
    email: typeof raw.email === 'string' ? raw.email.slice(0, 120) : null,
    avatar: typeof raw.avatar === 'string' && raw.avatar.length <= 4 ? raw.avatar : null,
    method,
    createdAt: typeof raw.createdAt === 'number' && Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
  }
}

function parseSession(body: AuthEndpointResponse): Session {
  const user = parseUser(body.user)
  const accessToken = typeof body.accessToken === 'string' ? body.accessToken : null
  const expiresAt = typeof body.expiresAt === 'number' && Number.isFinite(body.expiresAt) ? body.expiresAt : null
  return { user, accessToken, expiresAt }
}

export class RemoteAuthProvider implements AuthProvider {
  readonly id = 'remote'
  private base: string
  private googleClientId: string | null

  constructor(baseUrl: string, googleClientId: string | null) {
    this.base = baseUrl.replace(/\/+$/, '')
    this.googleClientId = googleClientId
  }

  capabilities(): AuthCapabilities {
    return {
      google: !!this.googleClientId,
      password: true,
      guest: true,
      demo: false,
      reason: this.googleClientId ? null : 'VITE_GOOGLE_CLIENT_ID is not set, so Google sign-in is disabled.',
    }
  }

  private token(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  private setToken(token: string | null): void {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token)
      else sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      // Non-fatal: the session just won't survive a reload.
    }
  }

  private async call(path: string, init?: RequestInit): Promise<AuthEndpointResponse> {
    const token = this.token()
    let res: Response
    try {
      res = await fetch(`${this.base}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
        credentials: 'include',
      })
    } catch {
      throw new AuthError('NETWORK', 'Could not reach the authentication server.')
    }
    if (res.status === 401 || res.status === 403) {
      throw new AuthError('INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }
    if (!res.ok) throw new AuthError('NETWORK', `Authentication server error (${res.status}).`)
    try {
      return (await res.json()) as AuthEndpointResponse
    } catch {
      throw new AuthError('NETWORK', 'Malformed response from auth server.')
    }
  }

  async restore(): Promise<Session | null> {
    if (!this.token()) return null
    try {
      const session = parseSession(await this.call('/auth/session'))
      this.setToken(session.accessToken ?? this.token())
      return session
    } catch {
      this.setToken(null)
      return null
    }
  }

  // Full redirect to the backend, which owns the client secret and performs the
  // code exchange. Nothing secret passes through this file.
  async signInWithGoogle(): Promise<Session> {
    if (!this.googleClientId) {
      throw new AuthError('NOT_CONFIGURED', 'Google sign-in is disabled: VITE_GOOGLE_CLIENT_ID is not set.')
    }
    const back = encodeURIComponent(location.origin + location.pathname)
    location.assign(`${this.base}/auth/google/start?client_id=${encodeURIComponent(this.googleClientId)}&redirect=${back}`)
    // The page is navigating away; this promise intentionally never settles.
    return new Promise<Session>(() => {})
  }

  async signInWithPassword(creds: PasswordCredentials): Promise<Session> {
    const email = validEmail(creds.email)
    if (!email) throw new AuthError('INVALID_INPUT', 'Enter a valid email address.')
    if (!validPassword(creds.password)) throw new AuthError('INVALID_INPUT', 'Password must be at least 8 characters.')
    const session = parseSession(
      await this.call('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: creds.password }) }),
    )
    this.setToken(session.accessToken)
    return session
  }

  async registerWithPassword(creds: PasswordCredentials): Promise<Session> {
    const email = validEmail(creds.email)
    const displayName = validDisplayName(creds.displayName ?? '')
    if (!email) throw new AuthError('INVALID_INPUT', 'Enter a valid email address.')
    if (!validPassword(creds.password)) throw new AuthError('INVALID_INPUT', 'Password must be at least 8 characters.')
    if (!displayName) throw new AuthError('INVALID_INPUT', 'Display name must be at least 2 characters.')
    const session = parseSession(
      await this.call('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: creds.password, displayName }),
      }),
    )
    this.setToken(session.accessToken)
    return session
  }

  async signInAsGuest(displayName: string): Promise<Session> {
    const name = validDisplayName(displayName) ?? 'CUMA'
    const session = parseSession(
      await this.call('/auth/guest', { method: 'POST', body: JSON.stringify({ displayName: name }) }),
    )
    this.setToken(session.accessToken)
    return session
  }

  async signOut(): Promise<void> {
    try {
      await this.call('/auth/logout', { method: 'POST' })
    } catch {
      // Local sign-out must succeed even if the server is unreachable.
    }
    this.setToken(null)
  }

  async updateProfile(patch: Partial<Pick<AuthUser, 'displayName' | 'avatar'>>): Promise<AuthUser> {
    const body = await this.call('/auth/profile', { method: 'PATCH', body: JSON.stringify(patch) })
    return parseUser(body.user)
  }
}
