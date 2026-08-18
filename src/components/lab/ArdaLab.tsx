import { Sparkles } from '@react-three/drei'
import { LabShell } from './LabShell'
import { LabLighting } from './LabLighting'
import { ProjectHologram } from './ProjectHologram'
import { ProjectCore } from './ProjectCore'
import { IdeaWall } from './IdeaWall'
import { AchievementCore } from './AchievementCore'
import { ServerRacks } from './ServerRacks'
import { LabProps } from './LabProps'
import { InteractableTrigger } from '../interaction/InteractableTrigger'
import { LAB, LAB_CX, LAB_CZ, LAB_W, LAB_D, LAB_ANCHORS } from '../../config/labLayout'
import type { GraphicsQuality, InteractableInfo } from '../../types'

// Trigger volumes for the lab's interactive stations.
const STATIONS: { info: InteractableInfo; position: [number, number, number]; radius: number }[] = [
  {
    info: { id: 'lab-hologram', kind: 'labHologram', label: 'Project Hologram', prompt: 'Manage projects' },
    position: [LAB_ANCHORS.hologram[0], LAB_ANCHORS.hologram[1], LAB_ANCHORS.hologram[2]],
    radius: 2.4,
  },
  {
    info: { id: 'lab-core', kind: 'labCore', label: 'Project Core', prompt: 'Read core stats' },
    position: [LAB_ANCHORS.core[0], 1.2, LAB_ANCHORS.core[2]],
    radius: 1.9,
  },
  {
    info: { id: 'lab-terminal', kind: 'labTerminal', label: 'Code Terminal', prompt: 'Open terminal' },
    position: [LAB_ANCHORS.terminal[0], 1.0, LAB_ANCHORS.terminal[2] - 0.5],
    radius: 1.8,
  },
  {
    info: { id: 'lab-ai', kind: 'labAi', label: 'ARDA AI Terminal', prompt: 'Talk to ARDA AI' },
    position: [LAB_ANCHORS.aiTerminal[0], 1.0, LAB_ANCHORS.aiTerminal[2] - 0.5],
    radius: 1.8,
  },
  {
    info: { id: 'lab-ideas', kind: 'labIdeas', label: 'Idea Wall', prompt: 'Open ideas' },
    position: [LAB_ANCHORS.ideaWall[0] - 0.5, LAB_ANCHORS.ideaWall[1], LAB_ANCHORS.ideaWall[2]],
    radius: 2.2,
  },
  {
    info: { id: 'lab-ach', kind: 'labAchievements', label: 'Achievement Core', prompt: 'View achievements' },
    position: [LAB_ANCHORS.achWall[0], LAB_ANCHORS.achWall[1], LAB_ANCHORS.achWall[2] + 0.5],
    radius: 2.4,
  },
  {
    info: { id: 'lab-future', kind: 'labFuture', label: 'Future Projects', prompt: 'View roadmap' },
    position: [LAB_ANCHORS.future[0], LAB_ANCHORS.future[1], LAB_ANCHORS.future[2] + 0.5],
    radius: 1.9,
  },
  {
    info: { id: 'lab-exit', kind: 'labExit', label: 'Exit', prompt: 'Return to room' },
    position: [LAB_ANCHORS.exit[0], LAB_ANCHORS.exit[1], LAB_ANCHORS.exit[2]],
    radius: 2.0,
  },
]

// The entire ARDA LAB second space. Mounted only once the secret is discovered
// (persisted), so it costs nothing until then. Obeys the same quality tiers as
// the main room.
export function ArdaLab({ quality }: { quality: GraphicsQuality }) {
  const enrich = quality !== 'low'
  const holoQuality = quality

  return (
    <group>
      <LabLighting quality={quality} />
      <LabShell />
      <ProjectHologram quality={holoQuality} />
      <ProjectCore />
      <IdeaWall />
      <AchievementCore quality={holoQuality} />
      <ServerRacks />
      <LabProps />

      {enrich && (
        <Sparkles
          count={quality === 'high' ? 50 : 26}
          scale={[LAB_W - 1, LAB.height - 0.6, LAB_D - 1]}
          position={[LAB_CX, LAB.height / 2, LAB_CZ]}
          size={1.5}
          speed={0.16}
          opacity={0.3}
          color="#8fe6ff"
        />
      )}

      {STATIONS.map((s) => (
        <InteractableTrigger key={s.info.id} info={s.info} position={s.position} radius={s.radius} />
      ))}
    </group>
  )
}
