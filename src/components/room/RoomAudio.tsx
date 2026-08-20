import { useEffect } from 'react'
import { startAmbient, setAmbientLevel, setReverbWet } from '../../systems/audioSystem'
import { useTimeOfDay } from '../../hooks/useClock'
import { playerMotion } from '../../systems/playerMotion'

// Drives the environmental audio without any heavy processing: a barely-there
// ambient bed whose level tracks the time of day, and a per-room reverb amount
// so hard-surfaced rooms (tiled kitchen/bath) ring a little and soft ones
// (bedroom) stay dead. Polls on a slow timer — no per-frame work.
export function RoomAudio() {
  const tod = useTimeOfDay()

  useEffect(() => {
    setAmbientLevel(tod)
  }, [tod])

  useEffect(() => {
    const id = window.setInterval(() => {
      startAmbient() // no-op until audio is unlocked, then idempotent
      setAmbientLevel(tod)
      setReverbWet(roomReverbAt(playerMotion.x, playerMotion.z))
    }, 900)
    return () => window.clearInterval(id)
  }, [tod])

  return null
}

// Reverb wetness per area — soft rooms low, hard/echoey rooms higher.
function roomReverbAt(x: number, z: number): number {
  // Bathroom (tiled, small) — most reverberant
  if (x >= 1.5 && x <= 5.5 && z >= 14 && z <= 19) return 0.34
  // Kitchen (tiled, hard surfaces)
  if (x >= 1.5 && x <= 9.5 && z >= 6 && z <= 14) return 0.2
  // Hallway (narrow, a bit hollow)
  if (x >= -1.5 && x <= 1.5 && z >= 6 && z <= 14) return 0.18
  // Living room (larger, some soft furnishing)
  if (x >= -10 && x <= -1.5 && z >= 6 && z <= 14) return 0.12
  // Bedroom (soft, quiet)
  if (x >= -6 && x <= 1.5 && z >= 14 && z <= 22) return 0.05
  // Balcony (outdoor, open — almost no reverb)
  if (x <= -10) return 0.02
  // Study (default home base)
  return 0.09
}
