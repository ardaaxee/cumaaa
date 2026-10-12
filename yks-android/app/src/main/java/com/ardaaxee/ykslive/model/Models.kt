package com.ardaaxee.ykslive.model

import kotlinx.serialization.Serializable

@Serializable
data class SdpPayload(val type: String, val sdp: String)

@Serializable
data class CandidatePayload(
    val candidate: String,
    val sdpMid: String? = null,
    val sdpMLineIndex: Int = 0,
)

@Serializable
data class SignalEnvelope(
    val from: String,
    val description: SdpPayload? = null,
    val candidate: CandidatePayload? = null,
)

@Serializable
data class HelloPayload(val from: String, val at: Long, val name: String? = null)

@Serializable
data class SecurePacket(
    // Varsayılan değer YOK: Supabase istemcisinin JSON'u varsayılanları yazmaz; "v" eksik giden paketi web
    // (packet.v !== 2) reddediyordu ve uygulama ile tarayıcı hiç el sıkışamıyordu.
    val v: Int,
    val from: String,
    val iv: String,
    val data: String,
    val at: Long,
)

@Serializable
data class ChatPayload(
    val id: String,
    val from: String,
    val text: String,
    val at: Long,
    val name: String? = null,
)

data class ChatLine(val mine: Boolean, val text: String, val at: Long, val sender: String? = null)
