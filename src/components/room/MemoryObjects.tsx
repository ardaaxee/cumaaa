import { useMemo } from 'react'
import { useRoomStore } from '../../store/useRoomStore'
import { ANCHORS, HALF_W, HALF_D } from '../../config/roomLayout'
import { InteractableTrigger } from '../interaction/InteractableTrigger'
import {
  recentProjects,
  archivedProjectCount,
  resolveCurrentProject,
  trophyTier,
  ardaRoomComplete,
  recentActivity,
} from '../../systems/memorySystem'
import { projectCardTexture, paperListTexture, platePlateTexture } from '../../utils/cardTextures'
import type { ActivityEntry, GraphicsQuality, Project } from '../../types'

// The room's "memory" — physical objects rebuilt every render from the live
// stores, so the space visibly reflects what ARDA has done. All matte/printed
// metal & paper to match the photographic style (no neon). Nothing here adds
// colliders; interaction triggers open small info panels that read the store.
export function MemoryObjects({ quality }: { quality: GraphicsQuality }) {
  const projects = useRoomStore((s) => s.projects)
  const currentProjectId = useRoomStore((s) => s.currentProjectId)
  const achievements = useRoomStore((s) => s.achievements)
  const activity = useRoomStore((s) => s.activity)

  const current = resolveCurrentProject(projects, currentProjectId)
  const shelf = recentProjects(projects)
  const archived = archivedProjectCount(projects)
  const tier = trophyTier(achievements)
  const roomTrophy = ardaRoomComplete(projects)
  const detail = quality !== 'low'

  const [dx, , dz] = ANCHORS.desk.pos

  return (
    <group>
      {/* ---- Desk: identity + current project + trophies ---- */}
      <NamePlate position={[dx + 0.0, 0.795, dz + 0.33]} />
      {current && <CurrentProjectCard project={current} position={[dx - 1.28, 0.79, dz + 0.24]} />}
      <DeskTrophies tier={tier} position={[dx + 1.32, 0.79, dz + 0.1]} />
      {roomTrophy && <ArdaRoomTrophy position={[dx + 0.62, 0.79, dz - 0.15]} />}

      {/* ---- Right wall: project archive shelf ---- */}
      <ProjectArchiveShelf shelf={shelf} archived={archived} detail={detail} />

      {/* ---- Front wall: activity board ---- */}
      <ActivityBoard activity={activity} />

      {/* ---- Interaction triggers ---- */}
      {current && (
        <InteractableTrigger
          info={{ id: 'mem-current', kind: 'currentProject', label: 'Current Project', prompt: current.name }}
          position={[dx - 1.28, 0.95, dz + 0.24]}
          radius={1.2}
        />
      )}
      <InteractableTrigger
        info={{ id: 'mem-archive', kind: 'projectArchive', label: 'Project Archive', prompt: 'View project history' }}
        position={[HALF_W - 0.6, 1.5, 1.6]}
        radius={2.0}
      />
      <InteractableTrigger
        info={{ id: 'mem-activity', kind: 'activityWall', label: 'Activity', prompt: 'Recent activity' }}
        position={[-3.0, 1.7, -HALF_D + 0.6]}
        radius={2.0}
      />
    </group>
  )
}

function PlateLabel({
  text,
  size,
  position,
  rotation,
}: {
  text: string
  size: [number, number, number]
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const t = useMemo(() => platePlateTexture(text), [text])
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={t} color="#8a8e93" metalness={0.8} roughness={0.4} />
    </mesh>
  )
}

function NamePlate({ position }: { position: [number, number, number] }) {
  const name = useRoomStore((s) => s.profile.name)
  return (
    <group position={position} rotation={[-0.32, 0, 0]}>
      <PlateLabel text={name.slice(0, 10).toUpperCase()} size={[0.26, 0.07, 0.02]} position={[0, 0, 0]} />
      <mesh position={[0, -0.045, 0.01]}>
        <boxGeometry args={[0.3, 0.03, 0.05]} />
        <meshStandardMaterial color="#2a2018" roughness={0.6} />
      </mesh>
    </group>
  )
}

function CurrentProjectCard({ project, position }: { project: Project; position: [number, number, number] }) {
  const t = useMemo(
    () => projectCardTexture(project),
    [project.id, project.name, project.progress, project.status, project.technologies.join(',')],
  )
  return (
    <group position={position} rotation={[0, 0.22, 0]}>
      <mesh position={[0, 0.12, -0.05]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.02, 0.28, 0.02]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.19, 0.01]} />
        <meshStandardMaterial map={t} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.06, 0.03]}>
        <boxGeometry args={[0.32, 0.02, 0.06]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.6} />
      </mesh>
    </group>
  )
}

function DeskTrophies({ tier, position }: { tier: 0 | 1 | 2 | 3; position: [number, number, number] }) {
  if (tier === 0) return null
  const heights = [0.1, 0.14, 0.18].slice(0, tier)
  return (
    <group position={position}>
      {heights.map((h, i) => (
        <group key={i} position={[i * 0.11 - (heights.length - 1) * 0.055, 0, 0]}>
          <mesh position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.06, 0.03, 0.06]} />
            <meshStandardMaterial color="#2a221a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.03 + h * 0.4, 0]}>
            <cylinderGeometry args={[0.006, 0.008, h * 0.8, 8]} />
            <meshStandardMaterial color="#b9962e" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.03 + h * 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.014, h * 0.5, 12]} />
            <meshStandardMaterial color="#caa53a" metalness={0.9} roughness={0.28} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ArdaRoomTrophy({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.22, 0.04, 0.16]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.55} metalness={0.05} />
      </mesh>
      <PlateLabel text="ARDA ROOM" size={[0.16, 0.04, 0.005]} position={[0, 0.05, 0.081]} rotation={[-0.3, 0, 0]} />
      <mesh position={[0, 0.09, -0.01]} castShadow>
        <boxGeometry args={[0.1, 0.07, 0.1]} />
        <meshStandardMaterial color="#c9bfa6" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.145, -0.01]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.085, 0.05, 4]} />
        <meshStandardMaterial color="#6e3a30" roughness={0.6} />
      </mesh>
    </group>
  )
}

function ProjectArchiveShelf({ shelf, archived, detail }: { shelf: Project[]; archived: number; detail: boolean }) {
  return (
    // Right wall (+X): face -X into the room.
    <group position={[HALF_W - 0.12, 1.35, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.32]} />
        <meshStandardMaterial color="#4a3826" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.28, -0.02]}>
        <boxGeometry args={[2.4, 0.5, 0.02]} />
        <meshStandardMaterial color="#3a3028" roughness={0.8} />
      </mesh>
      <PlateLabel text="PROJECTS" size={[0.7, 0.1, 0.01]} position={[-0.85, 0.42, 0]} />
      {shelf.map((p, i) => (
        <ShelfCard key={p.id} project={p} x={-0.95 + i * 0.42} detail={detail} />
      ))}
      {archived > 0 && <ArchiveBox count={archived} position={[1.02, 0.14, 0.02]} />}
    </group>
  )
}

function ShelfCard({ project, x, detail }: { project: Project; x: number; detail: boolean }) {
  const t = useMemo(
    () => projectCardTexture(project),
    [project.id, project.name, project.progress, project.status, project.technologies.join(',')],
  )
  const lean = (Math.abs((x * 13) % 3) - 1) * 0.05
  return (
    <group position={[x, 0.16, 0.02]} rotation={[0, 0, lean]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.22, 0.015]} />
        <meshStandardMaterial map={t} roughness={0.85} />
      </mesh>
      {detail && (
        <mesh position={[0, -0.12, 0.02]}>
          <boxGeometry args={[0.14, 0.02, 0.08]} />
          <meshStandardMaterial color="#2a2018" roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}

function ArchiveBox({ count, position }: { count: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.22, 0.24]} />
        <meshStandardMaterial color="#8a7a5c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.26]} />
        <meshStandardMaterial color="#7a6a4c" roughness={0.85} />
      </mesh>
      <PlateLabel text={`+${count}`} size={[0.16, 0.06, 0.005]} position={[0, 0.0, 0.121]} />
    </group>
  )
}

function ActivityBoard({ activity }: { activity: ActivityEntry[] }) {
  const lines = recentActivity(activity, 6).map((a) => a.text)
  const t = useMemo(() => paperListTexture('ARDA ACTIVITY', lines), [lines.join('|')])
  return (
    // Front wall (-Z): face +Z into the room.
    <group position={[-3.0, 1.7, -HALF_D + 0.11]}>
      <mesh castShadow>
        <boxGeometry args={[0.86, 0.78, 0.04]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.74, 0.66]} />
        <meshStandardMaterial map={t} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0.04]}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshStandardMaterial color="#7a2f2f" roughness={0.4} />
      </mesh>
    </group>
  )
}
