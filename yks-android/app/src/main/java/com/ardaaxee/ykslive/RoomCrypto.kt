package com.ardaaxee.ykslive

import android.util.Base64
import com.ardaaxee.ykslive.model.SecurePacket
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import java.util.Locale

class RoomCrypto(roomCode: String) {
    private val random = SecureRandom()
    private val key: SecretKey

    init {
        val normalized = roomCode.trim().uppercase(Locale.ROOT)
        val spec = PBEKeySpec(
            normalized.toCharArray(),
            "yks-live-e2ee-v2".toByteArray(Charsets.UTF_8),
            120_000,
            256,
        )
        val bytes = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            .generateSecret(spec)
            .encoded
        spec.clearPassword()
        key = SecretKeySpec(bytes, "AES")
        bytes.fill(0)
    }

    fun encrypt(event: String, from: String, plaintext: String): SecurePacket {
        val iv = ByteArray(12).also(random::nextBytes)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, iv))
        cipher.updateAAD(event.toByteArray(Charsets.UTF_8))
        val encrypted = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
        return SecurePacket(
            from = from,
            iv = encode(iv),
            data = encode(encrypted),
            at = System.currentTimeMillis(),
        )
    }

    fun decrypt(event: String, packet: SecurePacket): String {
        require(packet.v == 2) { "Unsupported packet version" }
        require(kotlin.math.abs(System.currentTimeMillis() - packet.at) < 10 * 60 * 1000L) {
            "Expired packet"
        }
        val iv = decode(packet.iv)
        require(iv.size == 12) { "Invalid IV" }
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
        cipher.updateAAD(event.toByteArray(Charsets.UTF_8))
        return cipher.doFinal(decode(packet.data)).toString(Charsets.UTF_8)
    }

    private fun encode(bytes: ByteArray): String =
        Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

    private fun decode(value: String): ByteArray =
        Base64.decode(value, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)

    companion object {
        fun topicId(roomCode: String): String {
            val normalized = roomCode.trim().uppercase(Locale.ROOT)
            val digest = MessageDigest.getInstance("SHA-256")
                .digest(normalized.toByteArray(Charsets.UTF_8))
            return Base64.encodeToString(
                digest,
                Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING,
            ).take(32)
        }
    }
}
