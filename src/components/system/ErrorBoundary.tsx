import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

// Top-level guard so a failed 3D asset or render never white-screens the app.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Single, quiet log — no console spam loops.
    // eslint-disable-next-line no-console
    console.warn('[ARDA ROOM] recovered from error:', error.message, info.componentStack)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-ink-950 p-6 text-center">
          <h1 className="font-mono text-lg tracking-widest text-accent-soft">ARDA ROOM</h1>
          <p className="max-w-sm text-sm text-white/60">
            Something went wrong while rendering the room. Your saved data is safe.
          </p>
          <button className="hud-btn-primary" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
