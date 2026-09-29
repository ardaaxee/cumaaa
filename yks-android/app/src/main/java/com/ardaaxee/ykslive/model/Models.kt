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
data class HelloPayload(val from: String, val at: Long)

@Serializable
data class SecurePacket(
    val v: Int = 2,
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
)

data class ChatLine(val mine: Boolean, val text: String, val at: Long)
