package com.ardaaxee.ykslive

import com.ardaaxee.ykslive.model.SecurePacket
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SecurePacketTest {
    /** Supabase istemcisi varsayılanları yazmayan JSON kullanır; "v" yine de pakette olmalı (web onsuz reddeder). */
    @Test
    fun versionIsSerializedEvenWhenDefaultsAreSkipped() {
        val packet = SecurePacket(v = RoomCrypto.PACKET_VERSION, from = "android-1", iv = "iv", data = "data", at = 1L)
        val text = Json { encodeDefaults = false }.encodeToString(packet)
        assertTrue(text, text.contains("\"v\":2"))
    }

    @Test
    fun decodesPacketsSentByTheWebApp() {
        val web = """{"v":2,"from":"WEBPEER123","iv":"aXY","data":"ZGF0YQ","at":1700000000000,"extra":true}"""
        val packet = Json { ignoreUnknownKeys = true }.decodeFromString<SecurePacket>(web)
        assertEquals(2, packet.v)
        assertEquals("WEBPEER123", packet.from)
    }
}
