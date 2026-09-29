package com.ardaaxee.ykslive

import com.ardaaxee.ykslive.model.ChatPayload
import com.ardaaxee.ykslive.model.HelloPayload
import com.ardaaxee.ykslive.model.SignalEnvelope
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.broadcast
import io.github.jan.supabase.realtime.broadcastFlow
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.seconds

class SignalingClient(
    private val roomCode: String,
    private val clientId: String,
    private val scope: CoroutineScope,
    private val listener: Listener,
) {
    interface Listener {
        fun onSignal(signal: SignalEnvelope)
        fun onPeerSeen(peerId: String)
        fun onChat(message: ChatPayload)
        fun onStatus(status: String)
    }

    private val supabase = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_PUBLISHABLE_KEY,
    ) {
        install(Realtime) { reconnectDelay = 2.seconds }
    }

    private val channel = supabase.realtime.createChannel("yks-live:$roomCode")
    private var heartbeat: Job? = null

    suspend fun connect() {
        listener.onStatus("Sinyal sunucusuna bağlanıyor…")

        channel.broadcastFlow<SignalEnvelope>("signal")
            .onEach { if (it.from != clientId) listener.onSignal(it) }
            .launchIn(scope)

        channel.broadcastFlow<HelloPayload>("hello")
            .onEach {
                if (it.from != clientId) {
                    listener.onPeerSeen(it.from)
                    sendHello()
                }
            }
            .launchIn(scope)

        channel.broadcastFlow<ChatPayload>("chat")
            .onEach { if (it.from != clientId) listener.onChat(it) }
            .launchIn(scope)

        supabase.realtime.connect()
        channel.join(blockUntilJoined = true)
        listener.onStatus("Odaya bağlandı")
        sendHello()

        heartbeat?.cancel()
        heartbeat = scope.launch {
            while (isActive) {
                delay(10_000)
                sendHello()
            }
        }
    }

    suspend fun sendSignal(signal: SignalEnvelope) = channel.broadcast("signal", signal)
    suspend fun sendChat(message: ChatPayload) = channel.broadcast("chat", message)

    private suspend fun sendHello() {
        channel.broadcast("hello", HelloPayload(clientId, System.currentTimeMillis()))
    }

    suspend fun close() {
        heartbeat?.cancel()
        heartbeat = null
        runCatching { channel.leave() }
        supabase.realtime.disconnect()
    }
}
