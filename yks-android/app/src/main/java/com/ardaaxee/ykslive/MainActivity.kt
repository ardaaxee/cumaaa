package com.ardaaxee.ykslive

import android.Manifest
import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Bitmap
import android.graphics.Color
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.view.Gravity
import android.widget.ImageView
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.ardaaxee.ykslive.model.ChatLine
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import org.webrtc.SurfaceViewRenderer
import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : Activity(), ScreenShareService.UiListener {
    private lateinit var roomInput: EditText
    private lateinit var status: TextView
    private lateinit var renderer: SurfaceViewRenderer
    private lateinit var chatText: TextView
    private lateinit var messageInput: EditText
    private lateinit var startButton: Button
    private lateinit var stopButton: Button
    private var service: ScreenShareService? = null
    private var bound = false
    private val projectionRequest = 8480
    private val random = SecureRandom()
    private lateinit var roomStore: SecureRoomStore

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            val local = binder as? ScreenShareService.LocalBinder ?: return
            service = local.service()
            bound = true
            service?.setUiListener(this@MainActivity)
            service?.attachRenderer(renderer)
            updateButtons()
        }
        override fun onServiceDisconnected(name: ComponentName?) {
            service = null
            bound = false
            updateButtons()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 910)
        }
        roomStore = SecureRoomStore(this)
        buildUi()
        val restored = savedInstanceState?.getString("room") ?: roomFromIntent(intent) ?: roomStore.load() ?: generateRoomCode()
        roomInput.setText(restored)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        roomFromIntent(intent)?.let {
            if (!ScreenShareService.running) roomInput.setText(it)
        }
    }

    override fun onStart() {
        super.onStart()
        if (ScreenShareService.running && !bound) bindToService()
    }

    override fun onDestroy() {
        if (bound) {
            service?.setUiListener(null)
            service?.detachRenderer()
            unbindService(connection)
            bound = false
        }
        super.onDestroy()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString("room", roomInput.text.toString())
        super.onSaveInstanceState(outState)
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(14), dp(16), dp(20))
            setBackgroundColor(Color.rgb(250, 248, 253))
        }
        root.addView(TextView(this).apply {
            text = "Cuma ♡ Zeynep Canlı"
            textSize = 23f
            setTextColor(Color.rgb(38, 30, 48))
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        })
        root.addView(TextView(this).apply {
            text = "Native Android · görünür izinli ekran paylaşımı"
            textSize = 13f
            setTextColor(Color.rgb(105, 92, 118))
            setPadding(0, dp(2), 0, dp(12))
        })

        roomInput = EditText(this).apply {
            hint = "Özel oda kodu"
            isSingleLine = true
        }
        root.addView(roomInput, lp(-1, dp(52)))

        val buttons = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        startButton = Button(this).apply {
            text = "Canlıyı başlat"
            setOnClickListener { requestProjection() }
        }
        stopButton = Button(this).apply {
            text = "Durdur"
            isEnabled = false
            setOnClickListener { service?.stopFromUi() ?: stopService(Intent(this@MainActivity, ScreenShareService::class.java)) }
        }
        buttons.addView(startButton, LinearLayout.LayoutParams(0, dp(52), 1f))
        buttons.addView(stopButton, LinearLayout.LayoutParams(0, dp(52), 1f).apply { marginStart = dp(8) })
        root.addView(buttons)

        status = TextView(this).apply {
            text = "Hazır"
            textSize = 13f
            setTextColor(Color.rgb(86, 72, 98))
            setPadding(0, dp(8), 0, dp(8))
        }
        root.addView(status)

        renderer = SurfaceViewRenderer(this).apply { setBackgroundColor(Color.rgb(18, 18, 22)) }
        root.addView(renderer, lp(-1, dp(300)))

        root.addView(Button(this).apply {
            text = "Web YKS canlı sayfasını aç"
            setOnClickListener {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(webInviteUrl())))
            }
        }, lp(-1, dp(48)))

        val inviteRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        inviteRow.addView(Button(this).apply {
            text = "Davet et"
            setOnClickListener { shareInvite() }
        }, LinearLayout.LayoutParams(0, dp(48), 1f))
        inviteRow.addView(Button(this).apply {
            text = "QR göster"
            setOnClickListener { showQr() }
        }, LinearLayout.LayoutParams(0, dp(48), 1f).apply { marginStart = dp(8) })
        root.addView(inviteRow)

        root.addView(TextView(this).apply {
            text = "Mesajlar"
            textSize = 17f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
            setPadding(0, dp(12), 0, dp(6))
        })

        val chatScroll = ScrollView(this)
        chatText = TextView(this).apply {
            text = "Henüz mesaj yok."
            textSize = 14f
            setTextColor(Color.rgb(48, 42, 54))
            setPadding(dp(10), dp(10), dp(10), dp(10))
        }
        chatScroll.addView(chatText, lp(-1, -2))
        root.addView(chatScroll, lp(-1, dp(160)))

        val chatRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        messageInput = EditText(this).apply {
            hint = "Mesaj yaz…"
            maxLines = 3
        }
        val send = Button(this).apply {
            text = "Gönder"
            setOnClickListener {
                val text = messageInput.text.toString().trim()
                if (text.isNotEmpty()) {
                    service?.sendChat(text)
                    messageInput.setText("")
                }
            }
        }
        chatRow.addView(messageInput, LinearLayout.LayoutParams(0, dp(54), 1f))
        chatRow.addView(send, LinearLayout.LayoutParams(dp(92), dp(54)))
        root.addView(chatRow)

        root.addView(TextView(this).apply {
            text = "Paylaşım açıkken Android sürekli bir foreground-service bildirimi gösterir. Sistem izin vermeden ekran yakalama başlamaz. Android projeksiyonu sonlandırırsa yeniden izin vermen gerekir."
            textSize = 11f
            setTextColor(Color.rgb(110, 98, 118))
            setPadding(0, dp(12), 0, 0)
        })
        setContentView(root)
    }

    private fun requestProjection() {
        val room = normalizedRoom()
        if (room.length < 12) {
            status.text = "Oda kodu en az 12 karakter olmalı."
            return
        }
        roomInput.setText(room)
        roomStore.save(room)
        val manager = getSystemService(MediaProjectionManager::class.java)
        startActivityForResult(manager.createScreenCaptureIntent(), projectionRequest)
    }

    @Deprecated("Broad Android compatibility")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != projectionRequest) return
        if (resultCode != RESULT_OK || data == null) {
            status.text = "Ekran paylaşımı izni verilmedi."
            return
        }
        val intent = Intent(this, ScreenShareService::class.java).apply {
            action = ScreenShareService.ACTION_START
            putExtra(ScreenShareService.EXTRA_ROOM, normalizedRoom())
            putExtra(ScreenShareService.EXTRA_PROJECTION_DATA, data)
        }
        startForegroundService(intent)
        window.decorView.postDelayed({ bindToService() }, 180)
        status.text = "Native ekran paylaşımı başlatılıyor…"
    }

    private fun bindToService() {
        if (!bound) bindService(Intent(this, ScreenShareService::class.java), connection, Context.BIND_AUTO_CREATE)
    }

    private fun normalizedRoom(): String =
        roomInput.text.toString().uppercase(Locale.ROOT).filter { it.isLetterOrDigit() }.take(24)

    private fun roomFromIntent(intent: Intent?): String? {
        val uri = intent?.data ?: return null
        val queryRoom = uri.getQueryParameter("room")
        val fragmentRoom = Regex("""(?:^|[?&])room=([A-Za-z0-9]+)""")
            .find(uri.fragment.orEmpty())
            ?.groupValues
            ?.getOrNull(1)
        return (queryRoom ?: fragmentRoom)
            ?.uppercase(Locale.ROOT)
            ?.filter { it.isLetterOrDigit() }
            ?.take(32)
            ?.takeIf { it.length >= 12 }
    }

    private fun webInviteUrl(): String =
        "https://ardaaxee.github.io/cumaaa/yks/?room=" + Uri.encode(normalizedRoom()) + "#/canli"

    private fun shareInvite() {
        val room = normalizedRoom()
        if (room.length < 12) {
            status.text = "Önce geçerli bir oda kodu oluştur."
            return
        }
        roomStore.save(room)
        val text = "YKS Canlı odasına katıl:\n" + webInviteUrl() + "\n\nUygulama yüklüyse: ykslive://join?room=" + Uri.encode(room)
        startActivity(
            Intent.createChooser(
                Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, text)
                },
                "Davet bağlantısını paylaş",
            )
        )
    }

    private fun showQr() {
        val room = normalizedRoom()
        if (room.length < 12) {
            status.text = "Önce geçerli bir oda kodu oluştur."
            return
        }
        roomStore.save(room)
        val matrix = MultiFormatWriter().encode(webInviteUrl(), BarcodeFormat.QR_CODE, 720, 720)
        val bitmap = Bitmap.createBitmap(matrix.width, matrix.height, Bitmap.Config.RGB_565)
        for (y in 0 until matrix.height) {
            for (x in 0 until matrix.width) {
                bitmap.setPixel(x, y, if (matrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        val image = ImageView(this).apply {
            setImageBitmap(bitmap)
            adjustViewBounds = true
            setPadding(dp(18), dp(18), dp(18), dp(18))
        }
        android.app.AlertDialog.Builder(this)
            .setTitle("Odaya katıl")
            .setMessage("Zeynep kamerayla bu QR'ı tarayabilir.")
            .setView(image)
            .setPositiveButton("Kapat", null)
            .show()
    }

    private fun generateRoomCode(): String {
        val alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return buildString { repeat(24) { append(alphabet[random.nextInt(alphabet.length)]) } }
    }

    override fun onStatus(text: String) {
        runOnUiThread {
            status.text = text
            updateButtons()
        }
    }

    override fun onChat(lines: List<ChatLine>) {
        runOnUiThread {
            val fmt = SimpleDateFormat("HH:mm", Locale("tr", "TR"))
            chatText.text = if (lines.isEmpty()) "Henüz mesaj yok." else lines.takeLast(30).joinToString("\n\n") {
                val who = if (it.mine) "Ben" else "Zeynep"
                "$who · ${fmt.format(Date(it.at))}\n${it.text}"
            }
        }
    }

    private fun updateButtons() {
        val active = ScreenShareService.running
        startButton.isEnabled = !active
        stopButton.isEnabled = active
        roomInput.isEnabled = !active
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
    private fun lp(w: Int, h: Int): ViewGroup.LayoutParams = ViewGroup.LayoutParams(w, h)
}
