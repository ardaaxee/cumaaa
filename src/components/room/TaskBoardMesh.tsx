import { ANCHORS } from '../../config/roomLayout'
import { useRoomStore } from '../../store/useRoomStore'

const NOTE_COLORS = ['#e8d97a', '#7ad0e8', '#e89a7a', '#a7e87a']

// Wall-mounted task board on the left wall. Shows live pending tasks as pinned
// cards — completing a task in the panel removes its card here.
export function TaskBoardMesh() {
  const [x, y, z] = ANCHORS.taskboard.pos
  const tasks = useRoomStore((s) => s.tasks)
  const pending = tasks.filter((t) => !t.done).slice(0, 6)

  return (
    <group position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
      {/* Cork board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.5, 0.06]} />
        <meshStandardMaterial color="#5a4326" roughness={0.9} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.3, 1.6, 0.04]} />
        <meshStandardMaterial color="#20242c" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Header strip */}
      <mesh position={[0, 0.62, 0.05]}>
        <planeGeometry args={[2.0, 0.18]} />
        <meshStandardMaterial color="#0a2230" emissive="#39d4e6" emissiveIntensity={0.4} />
      </mesh>

      {/* Task cards (2 columns x 3 rows) */}
      {pending.map((t, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const cx = col === 0 ? -0.5 : 0.5
        const cy = 0.28 - row * 0.42
        return (
          <group key={t.id} position={[cx, cy, 0.05]} rotation={[0, 0, (i % 2 === 0 ? 1 : -1) * 0.04]}>
            <mesh castShadow>
              <planeGeometry args={[0.8, 0.34]} />
              <meshStandardMaterial color={NOTE_COLORS[i % NOTE_COLORS.length]} roughness={0.9} />
            </mesh>
            {/* Pin */}
            <mesh position={[0, 0.13, 0.01]}>
              <sphereGeometry args={[0.03, 10, 10]} />
              <meshStandardMaterial color="#c23a3a" roughness={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
