package com.ardaaxee.ykslive

import com.ardaaxee.ykslive.model.ChatPayload
import com.ardaaxee.ykslive.model.HelloPayload
import com.ardaaxee.ykslive.model.SecurePacket
import com.ardaaxee.ykslive.model.SignalEnvelope
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.realtime.broadcast
import io.github.jan.supabase.realtime.broadcastFlow
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
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
        fun onRelayFrame(jpeg: ByteArray)
    }

    private val supabase = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL,
        supabaseKey = BuildConfig.SUPABASE_PUBLISHABLE_KEY,
    ) {
        install(Realtime) { reconnectDelay = 2.seconds }
    }

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }
    private val crypto = RoomCrypto(roomCode)
    private val channel = supabase.channel("yks-live:" + RoomCrypto.topicId(roomCode))
    private var heartbeat: Job? = null
    private val lastHelloFrom = java.util.concurrent.ConcurrentHashMap<String, Long>()

    suspend fun connect() {
        listener.onStatus("Şifreli odaya bağlanıyor…")

        channel.broadcastFlow<SecurePacket>("signal")
            .onEach { packet ->
                if (packet.from == clientId) return@onEach
                decode<SignalEnvelope>("signal", packet)?.let(listener::onSignal)
            }
            .launchIn(scope)

        channel.broadcastFlow<SecurePacket>("hello")
            .onEach { packet ->
                if (packet.from == clientId) return@onEach
                decode<HelloPayload>("hello", packet)?.let {
                    // Yalnız yeni (ya da uzun süre sessiz kalmış) eşe hemen cevap verilir; her selama cevap
                    // vermek iki taraf arasında bitmeyen bir selam döngüsü yaratıp kanalı tıkıyordu.
                    val now = System.currentTimeMillis()
                    val previous = lastHelloFrom.put(it.from, now)
                    listener.onPeerSeen(it.from)
                    if (previous == null || now - previous > HELLO_REPLY_GAP_MS) sendHello()
                }
            }
            .launchIn(scope)

        channel.broadcastFlow<SecurePacket>(RELAY_EVENT)
            .onEach { packet ->
                if (packet.from == clientId) return@onEach
                runCatching { crypto.decryptBytes(RELAY_EVENT, packet) }
                    .getOrNull()
                    ?.let(listener::onRelayFrame)
            }
            .launchIn(scope)

        channel.broadcastFlow<SecurePacket>("chat")
            .onEach { packet ->
                if (packet.from == clientId) return@onEach
                decode<ChatPayload>("chat", packet)?.let(listener::onChat)
            }
            .launchIn(scope)

        channel.subscribe(blockUntilSubscribed = true)
        listener.onStatus("Uçtan uca şifreli odaya bağlandı")
        sendHello()

        heartbeat?.cancel()
        heartbeat = scope.launch {
            while (isActive) {
                delay(10_000)
                sendHello()
            }
        }
    }

    suspend fun sendSignal(signal: SignalEnvelope) {
        channel.broadcast("signal", encode("signal", signal))
    }

    /** Doğrudan bağlantı kurulamadığında ekran karesini şifreli olarak kanaldan gönderir. */
    suspend fun sendFrame(jpeg: ByteArray) {
        channel.broadcast(RELAY_EVENT, crypto.encryptBytes(RELAY_EVENT, clientId, jpeg))
    }

    /** Karşı tarafın selamı yakın zamanda geldi mi? */
    fun hasLivePeer(): Boolean {
        val now = System.currentTimeMillis()
        return lastHelloFrom.values.any { now - it < PEER_ALIVE_MS }
    }

    suspend fun sendChat(message: ChatPayload) {
        channel.broadcast("chat", encode("chat", message))
    }

    private suspend fun sendHello() {
        val hello = HelloPayload(clientId, System.currentTimeMillis())
        channel.broadcast("hello", encode("hello", hello))
    }

    private inline fun <reified T> encode(event: String, value: T): SecurePacket {
        return crypto.encrypt(event, clientId, json.encodeToString(value))
    }

    private inline fun <reified T> decode(event: String, packet: SecurePacket): T? {
        return runCatching {
            json.decodeFromString<T>(crypto.decrypt(event, packet))
        }.onFailure {
            listener.onStatus("Şifreli paket doğrulanamadı")
        }.getOrNull()
    }

    private companion object {
        const val HELLO_REPLY_GAP_MS = 25_000L
        const val PEER_ALIVE_MS = 30_000L
        const val RELAY_EVENT = "frame"
    }

    suspend fun close() {
        heartbeat?.cancel()
        heartbeat = null
        runCatching { channel.unsubscribe() }
        runCatching { supabase.realtime.removeChannel(channel) }
        supabase.realtime.disconnect()
    }
}
