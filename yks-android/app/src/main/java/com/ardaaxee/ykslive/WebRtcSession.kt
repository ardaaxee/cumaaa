package com.ardaaxee.ykslive

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjection
import android.util.DisplayMetrics
import android.view.WindowManager
import com.ardaaxee.ykslive.model.CandidatePayload
import com.ardaaxee.ykslive.model.SdpPayload
import com.ardaaxee.ykslive.model.SignalEnvelope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.webrtc.DataChannel
import org.webrtc.DefaultVideoDecoderFactory
import org.webrtc.DefaultVideoEncoderFactory
import org.webrtc.EglBase
import org.webrtc.IceCandidate
import org.webrtc.MediaConstraints
import org.webrtc.MediaStream
import org.webrtc.PeerConnection
import org.webrtc.PeerConnectionFactory
import org.webrtc.RtpReceiver
import org.webrtc.ScreenCapturerAndroid
import org.webrtc.SdpObserver
import org.webrtc.SessionDescription
import org.webrtc.SurfaceTextureHelper
import org.webrtc.VideoCapturer
import org.webrtc.VideoTrack

class WebRtcSession(
    private val context: Context,
    projectionData: Intent,
    private val clientId: String,
    private val scope: CoroutineScope,
    private val sendSignal: suspend (SignalEnvelope) -> Unit,
    private val callbacks: Callbacks,
) {
    interface Callbacks {
        fun onStatus(text: String)
        fun onRemoteVideo(track: VideoTrack?)
        fun onProjectionStopped()
    }

    private val eglBase = EglBase.create()
    private val factory: PeerConnectionFactory
    private val capturer: VideoCapturer
    private val surfaceHelper: SurfaceTextureHelper
    private val videoTrack: VideoTrack
    private var peer: PeerConnection? = null
    private var remoteId: String? = null
    private var remoteDescriptionSet = false
    private val pendingCandidates = mutableListOf<IceCandidate>()
    private var closed = false

    init {
        PeerConnectionFactory.initialize(
            PeerConnectionFactory.InitializationOptions.builder(context)
                .setEnableInternalTracer(false)
                .createInitializationOptions()
        )

        factory = PeerConnectionFactory.builder()
            .setVideoEncoderFactory(DefaultVideoEncoderFactory(eglBase.eglBaseContext, true, true))
            .setVideoDecoderFactory(DefaultVideoDecoderFactory(eglBase.eglBaseContext))
            .createPeerConnectionFactory()

        val source = factory.createVideoSource(true)
        surfaceHelper = SurfaceTextureHelper.create("YksScreenCapture", eglBase.eglBaseContext)
        capturer = ScreenCapturerAndroid(
            projectionData,
            object : MediaProjection.Callback() {
                override fun onStop() {
                    callbacks.onStatus("Android ekran paylaşımını durdurdu")
                    callbacks.onProjectionStopped()
                }
            }
        )
        capturer.initialize(surfaceHelper, context, source.capturerObserver)
        val (width, height) = captureSize()
        capturer.startCapture(width, height, 15)
        videoTrack = factory.createVideoTrack("yks-screen", source)
        ensurePeer().addTrack(videoTrack, listOf("yks-screen"))
        callbacks.onStatus("Ekran yakalama açık · karşı taraf bekleniyor")
    }

    fun eglContext(): EglBase.Context = eglBase.eglBaseContext

    private fun captureSize(): Pair<Int, Int> {
        val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        @Suppress("DEPRECATION")
        wm.defaultDisplay.getRealMetrics(metrics)
        val maxSide = maxOf(metrics.widthPixels, metrics.heightPixels).coerceAtLeast(1)
        val scale = minOf(1f, 1280f / maxSide)
        return Pair(
            (metrics.widthPixels * scale).toInt().coerceAtLeast(480),
            (metrics.heightPixels * scale).toInt().coerceAtLeast(480),
        )
    }

    private fun iceServers(): List<PeerConnection.IceServer> {
        val result = mutableListOf(
            PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer(),
            PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer(),
        )
        if (BuildConfig.TURN_URL.isNotBlank()) {
            result += PeerConnection.IceServer.builder(BuildConfig.TURN_URL)
                .setUsername(BuildConfig.TURN_USERNAME)
                .setPassword(BuildConfig.TURN_PASSWORD)
                .createIceServer()
        }
        return result
    }

    private fun ensurePeer(): PeerConnection {
        peer?.let { return it }
        val config = PeerConnection.RTCConfiguration(iceServers()).apply {
            sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN
            continualGatheringPolicy = PeerConnection.ContinualGatheringPolicy.GATHER_CONTINUALLY
        }
        val created = factory.createPeerConnection(config, object : PeerConnection.Observer {
            override fun onSignalingChange(newState: PeerConnection.SignalingState?) = Unit
            override fun onIceConnectionChange(newState: PeerConnection.IceConnectionState?) {
                callbacks.onStatus(
                    when (newState) {
                        PeerConnection.IceConnectionState.CONNECTED,
                        PeerConnection.IceConnectionState.COMPLETED -> "Canlı bağlantı kuruldu"
                        PeerConnection.IceConnectionState.DISCONNECTED -> "Bağlantı koptu · yeniden deneniyor"
                        PeerConnection.IceConnectionState.FAILED -> "Bağlantı başarısız · ICE yenileniyor"
                        else -> "Bağlantı hazırlanıyor"
                    }
                )
                if (newState == PeerConnection.IceConnectionState.FAILED ||
                    newState == PeerConnection.IceConnectionState.DISCONNECTED
                ) restartIce()
            }
            override fun onIceConnectionReceivingChange(receiving: Boolean) = Unit
            override fun onIceGatheringChange(newState: PeerConnection.IceGatheringState?) = Unit
            override fun onIceCandidate(candidate: IceCandidate?) {
                candidate ?: return
                scope.launch {
                    sendSignal(
                        SignalEnvelope(
                            from = clientId,
                            candidate = CandidatePayload(
                                candidate = candidate.sdp,
                                sdpMid = candidate.sdpMid,
                                sdpMLineIndex = candidate.sdpMLineIndex,
                            )
                        )
                    )
                }
            }
            override fun onIceCandidatesRemoved(candidates: Array<out IceCandidate>?) = Unit
            override fun onAddStream(stream: MediaStream?) = Unit
            override fun onRemoveStream(stream: MediaStream?) = Unit
            override fun onDataChannel(channel: DataChannel?) = Unit
            override fun onRenegotiationNeeded() = maybeOffer(false)
            override fun onAddTrack(receiver: RtpReceiver?, mediaStreams: Array<out MediaStream>?) {
                val track = receiver?.track()
                if (track is VideoTrack) callbacks.onRemoteVideo(track)
            }
            override fun onConnectionChange(newState: PeerConnection.PeerConnectionState?) {
                if (newState == PeerConnection.PeerConnectionState.CONNECTED) {
                    callbacks.onStatus("Canlı bağlantı kuruldu")
                }
            }
        }) ?: error("PeerConnection oluşturulamadı")
        peer = created
        return created
    }

    fun onPeerSeen(peerId: String) {
        if (peerId == clientId) return
        remoteId = peerId
        callbacks.onStatus("Karşı taraf bulundu · WebRTC hazırlanıyor")
        maybeOffer(false)
    }

    private fun amOfferer(): Boolean = remoteId?.let { clientId < it } == true

    private fun maybeOffer(iceRestart: Boolean) {
        if (!amOfferer() || closed) return
        val pc = ensurePeer()
        if (pc.signalingState() != PeerConnection.SignalingState.STABLE) return
        val constraints = MediaConstraints().apply {
            if (iceRestart) mandatory.add(MediaConstraints.KeyValuePair("IceRestart", "true"))
        }
        pc.createOffer(object : SdpAdapter() {
            override fun onCreateSuccess(desc: SessionDescription?) {
                desc ?: return
                pc.setLocalDescription(object : SdpAdapter() {
                    override fun onSetSuccess() {
                        scope.launch {
                            sendSignal(SignalEnvelope(clientId, SdpPayload("offer", desc.description)))
                        }
                    }
                }, desc)
            }
        }, constraints)
    }

    fun handleSignal(signal: SignalEnvelope) {
        if (signal.from == clientId || closed) return
        remoteId = signal.from
        val pc = ensurePeer()

        signal.description?.let { d ->
            val type = when (d.type.lowercase()) {
                "offer" -> SessionDescription.Type.OFFER
                "answer" -> SessionDescription.Type.ANSWER
                else -> return@let
            }
            pc.setRemoteDescription(object : SdpAdapter() {
                override fun onSetSuccess() {
                    remoteDescriptionSet = true
                    flushCandidates()
                    if (type == SessionDescription.Type.OFFER) {
                        pc.createAnswer(object : SdpAdapter() {
                            override fun onCreateSuccess(answer: SessionDescription?) {
                                answer ?: return
                                pc.setLocalDescription(object : SdpAdapter() {
                                    override fun onSetSuccess() {
                                        scope.launch {
                                            sendSignal(SignalEnvelope(clientId, SdpPayload("answer", answer.description)))
                                        }
                                    }
                                }, answer)
                            }
                        }, MediaConstraints())
                    }
                }
            }, SessionDescription(type, d.sdp))
        }

        signal.candidate?.let { c ->
            val ice = IceCandidate(c.sdpMid, c.sdpMLineIndex, c.candidate)
            if (remoteDescriptionSet) pc.addIceCandidate(ice) else pendingCandidates += ice
        }
    }

    private fun flushCandidates() {
        val pc = peer ?: return
        pendingCandidates.forEach { pc.addIceCandidate(it) }
        pendingCandidates.clear()
    }

    fun restartIce() {
        if (closed) return
        runCatching { peer?.restartIce() }
        maybeOffer(true)
    }

    fun close() {
        if (closed) return
        closed = true
        callbacks.onRemoteVideo(null)
        runCatching { capturer.stopCapture() }
        runCatching { capturer.dispose() }
        runCatching { surfaceHelper.dispose() }
        runCatching { videoTrack.dispose() }
        runCatching { peer?.close() }
        peer = null
        runCatching { factory.dispose() }
        runCatching { eglBase.release() }
    }

    private open class SdpAdapter : SdpObserver {
        override fun onCreateSuccess(desc: SessionDescription?) = Unit
        override fun onSetSuccess() = Unit
        override fun onCreateFailure(error: String?) = Unit
        override fun onSetFailure(error: String?) = Unit
    }
}
