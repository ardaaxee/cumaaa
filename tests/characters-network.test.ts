import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import WebSocket from 'ws'

test('two players retain chosen characters across joining and reconnecting', { timeout: 15000 }, async () => {
  const portProbe = createServer().listen(0, '127.0.0.1')
  await once(portProbe, 'listening')
  const port = (portProbe.address() as { port: number }).port
  await new Promise<void>(resolve => portProbe.close(() => resolve()))
  const server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  })
  const sockets: WebSocket[] = []
  try {
    await Promise.race([
      once(server.stdout!, 'data'),
      once(server, 'exit').then(() => { throw new Error('Server exited before startup') }),
    ])
    const connect = async () => {
      const socket = new WebSocket(`ws://127.0.0.1:${port}`)
      sockets.push(socket)
      await once(socket, 'open')
      return socket
    }
    const welcome = (socket: WebSocket, message: object) => new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No welcome received')), 3000)
      const receive = (raw: WebSocket.RawData) => {
        const msg = JSON.parse(String(raw))
        if (msg.t !== 'welcome') return
        clearTimeout(timeout)
        socket.off('message', receive)
        resolve(msg)
      }
      socket.on('message', receive)
      socket.send(JSON.stringify(message))
    })
    const host = await connect()
    const created = await welcome(host, { t: 'create', name: 'Zelda', look: 'atlas' })
    const guest = await connect()
    const joined = await welcome(guest, { t: 'join', roomId: created.roomId, name: 'Player Two', look: 'mira' })
    assert.equal(joined.peers[0].look, 'atlas')
    assert.equal(joined.lobby.find((p: any) => p.name === 'Player Two').look, 'mira')
    const peerLeft = new Promise<void>(resolve => {
      const receive = (raw: WebSocket.RawData) => {
        if (JSON.parse(String(raw)).t === 'peer_leave') {
          host.off('message', receive)
          resolve()
        }
      }
      host.on('message', receive)
    })
    guest.close()
    await peerLeft
    const reconnected = await connect()
    const restored = await welcome(reconnected, { t: 'join', roomId: created.roomId, name: 'Changed Name', look: 'mira' })
    assert.equal(restored.lobby.find((p: any) => p.name === 'Changed Name').look, 'mira')
    assert.equal(restored.peers[0].look, 'atlas')
    assert.equal(restored.roomId, created.roomId)
  } finally {
    sockets.forEach(socket => socket.terminate())
    server.kill()
    await once(server, 'exit')
  }
})
