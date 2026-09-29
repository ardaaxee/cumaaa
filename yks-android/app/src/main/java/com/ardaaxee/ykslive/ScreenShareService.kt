package com.ardaaxee.ykslive

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import com.ardaaxee.ykslive.model.ChatLine
import com.ardaaxee.ykslive.model.ChatPayload
import com.ardaaxee.ykslive.model.SignalEnvelope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.webrtc.SurfaceViewRenderer
import org.webrtc.VideoTrack
import java.util.UUID

class ScreenShareService : Service(), SignalingClient.Listener, WebRtcSession.Callbacks {
    interface UiListener {
        fun onStatus(text: String)
        fun onChat(lines: List<ChatLine>)
    }

    inner class LocalBinder : Binder() {
        fun service(): ScreenShareService = this@ScreenShareService
    }

    private val binder = LocalBinder()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val main = Handler(Looper.getMainLooper())
    private val clientId = "android-" + UUID.randomUUID().toString().replace("-", "").take(18)
    private var signaling: SignalingClient? = null
    private var rtc: WebRtcSession? = null
    private var renderer: SurfaceViewRenderer? = null
    private var remoteTrack: VideoTrack? = null
    private var ui: UiListener? = null
    private val chat = mutableListOf<ChatLine>()
    private var currentStatus = "Başlatılıyor…"

    companion object {
        const val ACTION_START = "com.ardaaxee.ykslive.START"
        const val ACTION_STOP = "com.ardaaxee.ykslive.STOP"
        const val EXTRA_ROOM = "room"
        const val EXTRA_PROJECTION_DATA = "projection_data"
        private const val CHANNEL_ID = "yks_live_share"
        private const val NOTIFICATION_ID = 848
        @Volatile var running: Boolean = false
    }

    override fun onCreate() {
        super.onCreate()
        running = true
        createNotificationChannel()
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopEverything("Paylaşım kullanıcı tarafından durduruldu")
            return START_NOT_STICKY
        }
        if (intent?.action != ACTION_START) return START_NOT_STICKY

        val room = intent.getStringExtra(EXTRA_ROOM)?.trim()?.uppercase().orEmpty()
        val projectionData = projectionIntent(intent)
        if (room.length < 12 || projectionData == null) {
            stopEverything("Geçersiz oda veya ekran izni")
            return START_NOT_STICKY
        }

        startProjectionForeground("Ekran paylaşımı hazırlanıyor")
        startSession(room, projectionData)
        return START_NOT_STICKY
    }

    @Suppress("DEPRECATION")
    private fun projectionIntent(intent: Intent): Intent? =
        if (Build.VERSION.SDK_INT >= 33) {
            intent.getParcelableExtra(EXTRA_PROJECTION_DATA, Intent::class.java)
        } else {
            intent.getParcelableExtra(EXTRA_PROJECTION_DATA)
        }

    private fun startSession(room: String, projectionData: Intent) {
        val sig = SignalingClient(room, clientId, scope, this)
        signaling = sig
        rtc = WebRtcSession(
            context = this,
            projectionData = projectionData,
            clientId = clientId,
            scope = scope,
            sendSignal = { sig.sendSignal(it) },
            callbacks = this,
        )
        scope.launch {
            runCatching { sig.connect() }
                .onFailure { postStatus("Sinyal bağlantısı koptu · uygulamayı açıp yeniden başlat") }
        }
    }

    fun setUiListener(listener: UiListener?) {
        ui = listener
        listener?.onStatus(currentStatus)
        listener?.onChat(chat.toList())
    }

    fun attachRenderer(view: SurfaceViewRenderer) {
        if (renderer === view) return
        detachRenderer()
        renderer = view
        val session = rtc ?: return
        runCatching {
            view.init(session.eglContext(), null)
            view.setEnableHardwareScaler(true)
            view.setMirror(false)
            remoteTrack?.addSink(view)
        }
    }

    fun detachRenderer() {
        val view = renderer ?: return
        remoteTrack?.removeSink(view)
        runCatching { view.release() }
        renderer = null
    }

    fun sendChat(text: String) {
        val clean = text.trim().take(1000)
        if (clean.isBlank()) return
        val payload = ChatPayload(
            id = UUID.randomUUID().toString().replace("-", "").take(12),
            from = clientId,
            text = clean,
            at = System.currentTimeMillis(),
        )
        chat += ChatLine(true, clean, payload.at)
        while (chat.size > 100) chat.removeAt(0)
        main.post { ui?.onChat(chat.toList()) }
        scope.launch { runCatching { signaling?.sendChat(payload) } }
    }

    fun stopFromUi() = stopEverything("Paylaşım durduruldu")

    override fun onSignal(signal: SignalEnvelope) { rtc?.handleSignal(signal) }
    override fun onPeerSeen(peerId: String) { rtc?.onPeerSeen(peerId) }

    override fun onChat(message: ChatPayload) {
        chat += ChatLine(false, message.text.take(1000), message.at)
        while (chat.size > 100) chat.removeAt(0)
        main.post { ui?.onChat(chat.toList()) }
    }

    override fun onStatus(status: String) {
        postStatus(status)
        updateNotification(status)
    }

    override fun onRemoteVideo(track: VideoTrack?) {
        main.post {
            remoteTrack?.let { old -> renderer?.let { old.removeSink(it) } }
            remoteTrack = track
            renderer?.let { r -> track?.addSink(r) }
        }
    }

    override fun onProjectionStopped() = stopEverything("Android ekran paylaşımını sonlandırdı")

    private fun postStatus(text: String) {
        currentStatus = text
        main.post { ui?.onStatus(text) }
    }

    private fun stopEverything(reason: String) {
        postStatus(reason)
        detachRenderer()
        remoteTrack = null
        rtc?.close()
        rtc = null
        val sig = signaling
        signaling = null
        if (sig != null) scope.launch { runCatching { sig.close() } }
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        running = false
        detachRenderer()
        rtc?.close()
        rtc = null
        scope.cancel()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                "Canlı ekran paylaşımı",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Ekran paylaşımı açıkken gösterilir"
                setShowBadge(false)
            }
        )
    }

    private fun notification(text: String): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 1, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val stopIntent = PendingIntent.getService(
            this, 2, Intent(this, ScreenShareService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return Notification.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .setContentTitle("Cuma ♡ Zeynep · ekran paylaşılıyor")
            .setContentText(text)
            .setContentIntent(openIntent)
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .addAction(Notification.Action.Builder(null, "Paylaşımı durdur", stopIntent).build())
            .build()
    }

    private fun startProjectionForeground(text: String) {
        val n = notification(text)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION)
        } else {
            startForeground(NOTIFICATION_ID, n)
        }
    }

    private fun updateNotification(text: String) {
        getSystemService(NotificationManager::class.java).notify(NOTIFICATION_ID, notification(text))
    }
}
