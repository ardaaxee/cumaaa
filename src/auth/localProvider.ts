import {
  AuthError,
  usernameFrom,
  validDisplayName,
  validEmail,
  validPassword,
  type AuthCapabilities,
  type AuthProvider,
  type AuthUser,
  type PasswordCredentials,
  type Session,
} from './types'

// DEMO provider: used when no auth backend is configured (VITE_AUTH_PROVIDER_URL
// unset). It lets you play and keeps an identity across reloads, and it is
// honest about what that means:
//
//   * NO password is ever stored, hashed or verified. Registering records an
//     email and a display name, nothing else — so this cannot be mistaken for,
//     or later upgraded into, a real credential store.
//   * Google sign-in is NOT offered here at all. Faking it would mean showing
//     "signed in with Google" for something Google never saw.
//
// Everything it writes is a local profile cache, which is why localStorage is
// acceptable: there is no secret in it.

const KEY = 'cuma-auth-v1'

interface StoredAccount {
  user: AuthUser
}

function load(): StoredAccount | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAccount
    if (!parsed?.user?.id || typeof parsed.user.displayName !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

function save(account: StoredAccount | null): void {
  try {
    if (account) localStorage.setItem(KEY, JSON.stringify(account))
    else localStorage.removeItem(KEY)
  } catch {
    // A blocked/full localStorage must not break sign-in — the session simply
    // won't survive a reload.
  }
}

function newId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function sessionOf(user: AuthUser): Session {
  return { user, accessToken: null, expiresAt: null }
}

export class LocalAuthProvider implements AuthProvider {
  readonly id = 'local-demo'

  capabilities(): AuthCapabilities {
    return {
      google: false,
      password: true,
      guest: true,
      demo: true,
      reason: 'No auth backend configured (VITE_AUTH_PROVIDER_URL). Google sign-in needs a server to hold the OAuth secret.',
    }
  }

  async restore(): Promise<Session | null> {
    const stored = load()
    return stored ? sessionOf(stored.user) : null
  }

  async signInWithGoogle(): Promise<Session> {
    throw new AuthError(
      'NOT_CONFIGURED',
      'Google sign-in is unavailable: it requires a backend holding the OAuth client secret. Set VITE_AUTH_PROVIDER_URL and VITE_GOOGLE_CLIENT_ID.',
    )
  }

  // In demo mode "sign in" and "register" are the same act: there is no stored
  // password to check against, so we never claim to have verified one.
  async signInWithPassword(creds: PasswordCredentials): Promise<Session> {
    return this.registerWithPassword(creds)
  }

  async registerWithPassword(creds: PasswordCredentials): Promise<Session> {
    const email = validEmail(creds.email)
    if (!email) throw new AuthError('INVALID_INPUT', 'Enter a valid email address.')
    if (!validPassword(creds.password)) {
      throw new AuthError('INVALID_INPUT', 'Password must be at least 8 characters.')
    }
    const name = validDisplayName(creds.displayName ?? email.split('@')[0])
    if (!name) throw new AuthError('INVALID_INPUT', 'Display name must be at least 2 characters.')

    const existing = load()
    const user: AuthUser = {
      id: existing?.user.email === email ? existing.user.id : newId(),
      displayName: name,
      username: usernameFrom(name, email),
      email,
      avatar: existing?.user.email === email ? existing.user.avatar : null,
      method: 'password',
      createdAt: existing?.user.email === email ? existing.user.createdAt : Date.now(),
    }
    save({ user })
    return sessionOf(user)
  }

  async signInAsGuest(displayName: string): Promise<Session> {
    const name = validDisplayName(displayName) ?? 'CUMA'
    const user: AuthUser = {
      id: newId(),
      displayName: name,
      username: usernameFrom(name, null),
      email: null,
      avatar: null,
      method: 'guest',
      createdAt: Date.now(),
    }
    save({ user })
    return sessionOf(user)
  }

  async signOut(): Promise<void> {
    save(null)
  }

  async updateProfile(patch: Partial<Pick<AuthUser, 'displayName' | 'avatar'>>): Promise<AuthUser> {
    const stored = load()
    if (!stored) throw new AuthError('INVALID_INPUT', 'Not signed in.')
    const displayName = patch.displayName ? validDisplayName(patch.displayName) : null
    if (patch.displayName && !displayName) {
      throw new AuthError('INVALID_INPUT', 'Display name must be at least 2 characters.')
    }
    const user: AuthUser = {
      ...stored.user,
      displayName: displayName ?? stored.user.displayName,
      username: displayName ? usernameFrom(displayName, stored.user.email) : stored.user.username,
      avatar: patch.avatar !== undefined ? patch.avatar : stored.user.avatar,
    }
    save({ user })
    return user
  }
}
