# YKS Canlı Android Companion

Native Android layer for **Cuma ♡ Zeynep Canlı**.

- Explicit Android MediaProjection consent.
- Visible mediaProjection foreground-service notification.
- Direct WebRTC screen video.
- Signaling and chat payloads are end-to-end encrypted with AES-256-GCM using a PBKDF2 key derived from the room code.
- Room codes are stored on-device encrypted with Android Keystore.
- Invite links and QR codes can open the matching web/native room.
- Supabase Realtime for signaling + chat only.
- Automatic Supabase reconnect + ICE restart.
- 24-character room codes by default.
- Optional TURN support for strict NAT / mobile networks.

## Platform limits

This is not a hidden recorder. Android 14+ requires fresh user consent for every MediaProjection capture session. If Android stops projection, the service stops and the user starts a new session. Android 15+ cannot auto-start mediaProjection from BOOT_COMPLETED.

## TURN (recommended)

Pass private values at build time; do not commit them:

```properties
TURN_URL=turn:turn.example.com:3478?transport=udp
TURN_USERNAME=...
TURN_PASSWORD=...
```

## Build

JDK 17 + Android SDK 36:

```bash
cd yks-android
gradle :app:assembleDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`
