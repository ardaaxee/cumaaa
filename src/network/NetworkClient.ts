import type { ClientMessage, ServerMessage } from './protocol'

// A thin, reconnecting WebSocket wrapper. It knows nothing about game state —
// it just moves typed messages and reports connection lifecycle. Reconnect uses
// capped exponential backoff; on reconnect the store re-issues create/join so
// the room state is restored.

export type ConnPhase = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed'

interface Handlers {
  onPhase: (phase: ConnPhase) => void
  onMessage: (msg: ServerMessage) => void
  onOpen: () => void
}

export class NetworkClient {
  private ws: WebSocket | null = null
  private url: string
  private handlers: Handlers
  private shouldRun = false
  private retry = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null

  constructor(url: string, handlers: Handlers) {
    this.url = url
    this.handlers = handlers
  }

  connect(): void {
    this.shouldRun = true
    this.open()
  }

  private open(): void {
    this.handlers.onPhase(this.retry === 0 ? 'connecting' : 'reconnecting')
    let ws: WebSocket
    try {
      ws = new WebSocket(this.url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.ws = ws

    ws.onopen = () => {
      this.retry = 0
      this.handlers.onPhase('open')
      this.handlers.onOpen()
      this.pingTimer = setInterval(() => this.send({ t: 'ping' }), 15_000)
    }
    ws.onmessage = (ev) => {
      let msg: ServerMessage
      try {
        msg = JSON.parse(ev.data as string) as ServerMessage
      } catch {
        return
      }
      this.handlers.onMessage(msg)
    }
    ws.onclose = () => {
      this.clearPing()
      if (this.shouldRun) this.scheduleReconnect()
      else this.handlers.onPhase('closed')
    }
    ws.onerror = () => {
      try {
        ws.close()
      } catch {
        /* ignore */
      }
    }
  }

  private scheduleReconnect(): void {
    this.handlers.onPhase('reconnecting')
    const delay = Math.min(1000 * 2 ** this.retry, 8000)
    this.retry += 1
    this.retryTimer = setTimeout(() => this.open(), delay)
  }

  private clearPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  send(msg: ClientMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
      return true
    }
    return false
  }

  isOpen(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  close(): void {
    this.shouldRun = false
    this.clearPing()
    if (this.retryTimer) clearTimeout(this.retryTimer)
    try {
      this.ws?.close()
    } catch {
      /* ignore */
    }
    this.ws = null
    this.handlers.onPhase('closed')
  }
}
