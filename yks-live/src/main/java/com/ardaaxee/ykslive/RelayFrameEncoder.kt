package com.ardaaxee.ykslive

import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import org.webrtc.VideoFrame
import org.webrtc.VideoSink
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Yedek görüntü yolu (web'deki liveRelay.ts ile aynı kurallar): doğrudan WebRTC bağlantısı kurulamadığında
 * ekran saniyede ~1 JPEG kare olarak şifreli kanaldan gönderilir. Kare boyutu Supabase mesaj sınırının
 * altında kalana kadar çözünürlük/kalite kademeli düşürülür; ekran değişmediyse kare tekrar gönderilmez.
 * Android, ekran değişmezken yeni kare üretmez: son kare her 5 sn'de bir yeniden gönderilir ve yedek yol
 * açıldığı an elde hazır bir kare olsun diye paylaşım boyunca 5 sn'de bir anlık görüntü alınır.
 */
class RelayFrameEncoder(
    private val shouldSend: () -> Boolean,
    private val onJpeg: (ByteArray) -> Unit,
) : VideoSink {
    private val worker = Executors.newSingleThreadScheduledExecutor { r -> Thread(r, "YksRelayEncoder") }
    private val busy = AtomicBoolean(false)
    @Volatile private var lastCaptureAt = 0L
    @Volatile private var lastSentAt = 0L
    @Volatile private var lastFingerprint = 0L
    @Volatile private var lastJpeg: ByteArray? = null
    @Volatile private var closed = false

    init {
        worker.scheduleWithFixedDelay({ resendIfIdle() }, INTERVAL_MS, INTERVAL_MS, TimeUnit.MILLISECONDS)
    }

    override fun onFrame(frame: VideoFrame) {
        val now = System.currentTimeMillis()
        if (closed) return
        val sending = shouldSend()
        val due = if (sending) now - lastCaptureAt >= INTERVAL_MS else now - lastCaptureAt >= KEEPALIVE_MS
        if (!due || !busy.compareAndSet(false, true)) return
        lastCaptureAt = now
        frame.retain()
        worker.execute {
            try {
                val jpeg = encode(frame) ?: return@execute
                lastJpeg = jpeg
                if (shouldSend()) send(jpeg)
            } catch (e: Throwable) {
                // Bir kare kaçarsa sonraki saniye yeniden denenir.
            } finally {
                frame.release()
                busy.set(false)
            }
        }
    }

    /** Ekran değişmiyorsa (yeni kare yok) son kareyi aralıklarla yeniden gönderir. */
    private fun resendIfIdle() {
        val jpeg = lastJpeg ?: return
        if (closed || !shouldSend()) return
        if (System.currentTimeMillis() - lastSentAt >= KEEPALIVE_MS) send(jpeg, force = true)
    }

    @Synchronized
    private fun send(jpeg: ByteArray, force: Boolean = false) {
        val fp = fingerprint(jpeg)
        val at = System.currentTimeMillis()
        if (!force && fp == lastFingerprint && at - lastSentAt < KEEPALIVE_MS) return
        lastFingerprint = fp
        lastSentAt = at
        onJpeg(jpeg)
    }

    fun close() {
        closed = true
        lastJpeg = null
        worker.shutdownNow()
    }

    private fun encode(frame: VideoFrame): ByteArray? {
        val srcW = frame.rotatedWidth
        val srcH = frame.rotatedHeight
        if (srcW <= 0 || srcH <= 0) return null
        for ((maxSide, quality) in STEPS) {
            val scale = minOf(1f, maxSide.toFloat() / maxOf(srcW, srcH))
            val w = even((frame.buffer.width * scale).toInt())
            val h = even((frame.buffer.height * scale).toInt())
            val scaled = frame.buffer.cropAndScale(0, 0, frame.buffer.width, frame.buffer.height, w, h)
            val i420 = scaled.toI420()
            scaled.release()
            val nv21 = try {
                toNv21(i420 ?: return null)
            } finally {
                i420?.release()
            }
            val out = ByteArrayOutputStream(64 * 1024)
            YuvImage(nv21, ImageFormat.NV21, w, h, null).compressToJpeg(Rect(0, 0, w, h), quality, out)
            if (out.size() <= MAX_BYTES) return out.toByteArray()
        }
        return null
    }

    private fun toNv21(buf: VideoFrame.I420Buffer): ByteArray {
        val w = buf.width
        val h = buf.height
        val out = ByteArray(w * h * 3 / 2)
        val y = buf.dataY
        val u = buf.dataU
        val v = buf.dataV
        var o = 0
        for (row in 0 until h) {
            y.position(row * buf.strideY)
            y.get(out, o, w)
            o += w
        }
        val cw = (w + 1) / 2
        val ch = (h + 1) / 2
        for (row in 0 until ch) {
            for (col in 0 until cw) {
                if (o + 1 >= out.size) break
                out[o++] = v.get(row * buf.strideV + col)
                out[o++] = u.get(row * buf.strideU + col)
            }
        }
        return out
    }

    private fun even(value: Int): Int = maxOf(2, value - (value and 1))

    /** Web'deki frameFingerprint ile aynı fikir: uzunluk + örneklemeli FNV-1a. */
    private fun fingerprint(bytes: ByteArray): Long {
        var h = 0x811c9dc5L
        val step = maxOf(1, bytes.size / 4096)
        var i = 0
        while (i < bytes.size) {
            h = ((h xor (bytes[i].toLong() and 0xff)) * 0x01000193L) and 0xffffffffL
            i += step
        }
        return (bytes.size.toLong() shl 32) or h
    }

    private companion object {
        const val INTERVAL_MS = 1_000L
        const val KEEPALIVE_MS = 5_000L
        const val MAX_BYTES = 140_000
        val STEPS = listOf(1280 to 62, 1024 to 50, 800 to 42, 640 to 34)
    }
}
