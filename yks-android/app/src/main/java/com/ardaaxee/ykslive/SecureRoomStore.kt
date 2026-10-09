package com.ardaaxee.ykslive

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import java.util.Locale

class SecureRoomStore(context: Context) {
    private val prefs = context.getSharedPreferences("yks_live_secure", Context.MODE_PRIVATE)

    fun load(): String? {
        val ivText = prefs.getString("room_iv", null) ?: return null
        val dataText = prefs.getString("room_data", null) ?: return null
        return runCatching {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(
                Cipher.DECRYPT_MODE,
                key(),
                GCMParameterSpec(128, decode(ivText)),
            )
            cipher.doFinal(decode(dataText)).toString(Charsets.UTF_8)
        }.getOrNull()
    }

    fun save(room: String) {
        val clean = room.trim().uppercase(Locale.ROOT)
        if (clean.length < 12) return
        runCatching {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, key())
            val encrypted = cipher.doFinal(clean.toByteArray(Charsets.UTF_8))
            prefs.edit()
                .putString("room_iv", encode(cipher.iv))
                .putString("room_data", encode(encrypted))
                .apply()
        }
    }

    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }

    private fun encode(bytes: ByteArray): String =
        Base64.encodeToString(bytes, Base64.NO_WRAP)

    private fun decode(value: String): ByteArray =
        Base64.decode(value, Base64.NO_WRAP)

    companion object {
        private const val KEY_ALIAS = "yks_live_room_key_v1"
    }
}
