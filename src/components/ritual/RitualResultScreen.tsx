import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { FONTS, EYE } from '../../tokens'
import { GodSvg } from '../gods/GodSvg'
import { getSvgRaw, outcomeEye } from '../gods/GodCard'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import type { God, Ritual } from '../../data/gods'

// This screen intentionally breaks from the app's dark theme (COLORS.black background) to match
// the Figma "result screen" frame (node 257:28962) exactly — light background, black text/icons.
const RESULT_BG = '#E4E4E4'
const RESULT_FG = '#000000'
const RESULT_DIVIDER = 'rgba(0,0,0,0.12)'

// Same outcome-color → label mapping RitualCard.tsx's outcomeEye() uses for its color/weight lookup —
// kept in sync by convention (see GodCard.tsx's outcomeEye export), not a shared import.
function outcomeLabel(outcomeColor: string): string {
  if (outcomeColor === '#c8322e') return 'Furious'
  if (outcomeColor === '#d4662a') return 'Offended'
  if (outcomeColor === '#d4a83c') return 'Uneasy'
  return 'Peaceful'
}

type ParticipantKey = 'prisoners' | 'volunteers' | 'children' | 'virgins'

const PARTICIPANT_ORDER: ParticipantKey[] = ['prisoners', 'volunteers', 'children', 'virgins']

const PARTICIPANT_ICON: Record<ParticipantKey, (color: string, size: number) => React.ReactNode> = {
  prisoners: (color, size) => <PrisonerIcon size={size} color={color} />,
  volunteers: (color, size) => <VolunteerIcon size={size} color={color} />,
  children: (color, size) => <ChildrenIcon size={size} color={color} />,
  virgins: (color, size) => <VirginIcon size={size} color={color} />,
}

// --- Reveal timeline -------------------------------------------------------
// 1. Faces + bare resource icons (no numbers/dashes yet), bottom bar shows totals, held briefly.
// 2. Each victim type gets its turn, in participant order: the bottom total counts down while
//    every god's own count for that type counts up from 0 (or reveals a "—" dash if unused).
// 3. Once distribution finishes, every god's eyes shift from their anger-level color to their
//    ritual's outcome color (driven by GodSvg's own eyeAnimation delay, not JS timers).
// 4. The caption under each card fades in last.
const INITIAL_PAUSE = 1.2
const RESOURCE_STEP_DURATION = 1.8
const RESOURCE_STEP_GAP = 0.5
const EYE_ANIM_DURATION = 3
const TEXT_REVEAL_GAP = 0.8

const DISTRIBUTION_END = INITIAL_PAUSE + PARTICIPANT_ORDER.length * (RESOURCE_STEP_DURATION + RESOURCE_STEP_GAP)
const TEXT_REVEAL_AT = DISTRIBUTION_END + EYE_ANIM_DURATION + TEXT_REVEAL_GAP

// Tweens a displayed integer from `from` to `to` over `duration` seconds once `active` goes true,
// then holds at `to`. Stays at `from` for as long as it hasn't had its turn yet.
function useCountTween(active: boolean, from: number, to: number, duration: number): number {
  const [value, setValue] = useState(from)
  useEffect(() => {
    if (!active) return
    const controls = animate(from, to, { duration, ease: 'easeOut', onUpdate: v => setValue(Math.round(v)) })
    return () => controls.stop()
    // from/to/duration are stable for a given card+type; only `active` should retrigger the tween.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
  return value
}

interface ParticipantRowProps {
  icon: (color: string, size: number) => React.ReactNode
  active: boolean
  revealed: boolean
  finalCount: number
}

function ParticipantRow({ icon, active, revealed, finalCount }: ParticipantRowProps) {
  const displayCount = useCountTween(active, 0, finalCount, RESOURCE_STEP_DURATION)
  const used = finalCount > 0
  const color = used ? RESULT_FG : 'rgba(0,0,0,0.32)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon(color, 16)}
      {revealed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ fontFamily: FONTS.spectral, fontSize: '16px', letterSpacing: '0.96px', color, whiteSpace: 'nowrap' }}
        >
          {used ? displayCount : '—'}
        </motion.span>
      )}
    </div>
  )
}

interface RitualResultCardProps {
  god: God
  ritual: Ritual
  scale: number
  stepIndex: number
  textRevealed: boolean
}

// Base (many-gods) text-block width — the grid/caption never scale, so this is also the card's
// floor width; the face can grow past it and the card widens to fit, but never narrower than this.
const RESULT_TEXT_BLOCK_WIDTH = 170

function RitualResultCard({ god, ritual, scale, stepIndex, textRevealed }: RitualResultCardProps) {
  const faceWidth = 116 * scale
  const fromEye = EYE[god.angerLevel]
  const toEye = outcomeEye(ritual.outcomeColor)
  return (
    <div
      style={{
        width: `${Math.max(RESULT_TEXT_BLOCK_WIDTH, faceWidth)}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: `${faceWidth}px`, height: `${180 * scale}px` }}>
        <GodSvg
          svgRaw={getSvgRaw(god.id)}
          angerLevel={god.angerLevel}
          bodyColor={RESULT_FG}
          instanceId={`result-${god.id}`}
          eyeAnimation={{
            fromColor: fromEye.color,
            fromWeight: fromEye.weight,
            toColor: toEye.color,
            toWeight: toEye.weight,
            delay: DISTRIBUTION_END,
            duration: EYE_ANIM_DURATION,
            id: `result-${god.id}`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: '22px',
          rowGap: '13px',
        }}
      >
        {PARTICIPANT_ORDER.map((key, i) => (
          <ParticipantRow
            key={key}
            icon={PARTICIPANT_ICON[key]}
            active={i === stepIndex}
            revealed={i <= stepIndex}
            finalCount={ritual.participants[key]}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: textRevealed ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          margin: 0,
          marginTop: '19px',
          fontFamily: FONTS.spectral,
          fontSize: '16px',
          letterSpacing: '0.96px',
          color: RESULT_FG,
          textAlign: 'center',
        }}
      >
        <span style={{ textTransform: 'uppercase' }}>{god.name}</span> will turn {outcomeLabel(ritual.outcomeColor)} in {ritual.duration}
      </motion.p>
    </div>
  )
}

interface RitualResultScreenProps {
  entries: Array<{ god: God; ritual: Ritual }>
  resources: { prisoners: number; volunteers: number; children: number; virgins: number }
  onDismiss: () => void
}

// Cards fill the available space instead of staying pinned at their base (many-gods) size —
// fewer gods on screen means each card scales up. sqrt keeps growth gentle (not linear) and the
// clamp keeps it from shrinking below its Figma-authored base size or growing absurdly for 1 god.
const RESULT_CARD_BASE_COUNT = 5
const RESULT_CARD_MAX_SCALE = 2.4

export function RitualResultScreen({ entries, resources, onDismiss }: RitualResultScreenProps) {
  const scale = Math.min(RESULT_CARD_MAX_SCALE, Math.sqrt(RESULT_CARD_BASE_COUNT / Math.max(entries.length, 1)))

  // `resources` is already post-sacrifice (what HomeScreen has left). The pre-sacrifice total is
  // that plus whatever this batch of rituals just spent — recoverable from `entries` alone, so the
  // countdown's start value doesn't need a separate prop from HomeScreen.
  const spent = entries.reduce(
    (sum, { ritual }) => ({
      prisoners: sum.prisoners + ritual.participants.prisoners,
      volunteers: sum.volunteers + ritual.participants.volunteers,
      children: sum.children + ritual.participants.children,
      virgins: sum.virgins + ritual.participants.virgins,
    }),
    { prisoners: 0, volunteers: 0, children: 0, virgins: 0 }
  )
  const before = {
    prisoners: resources.prisoners + spent.prisoners,
    volunteers: resources.volunteers + spent.volunteers,
    children: resources.children + spent.children,
    virgins: resources.virgins + spent.virgins,
  }

  const [stepIndex, setStepIndex] = useState(-1)
  const [textRevealed, setTextRevealed] = useState(false)

  useEffect(() => {
    const timers = PARTICIPANT_ORDER.map((_, i) =>
      setTimeout(() => setStepIndex(i), (INITIAL_PAUSE + i * (RESOURCE_STEP_DURATION + RESOURCE_STEP_GAP)) * 1000)
    )
    timers.push(setTimeout(() => setStepIndex(PARTICIPANT_ORDER.length), DISTRIBUTION_END * 1000))
    timers.push(setTimeout(() => setTextRevealed(true), TEXT_REVEAL_AT * 1000))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      onClick={onDismiss}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        backgroundColor: RESULT_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'center',
          justifyContent: 'center',
          columnGap: '101px',
          rowGap: '65px',
          maxWidth: '1364px',
          padding: '40px 84px',
          overflowY: 'auto',
        }}
      >
        {entries.map(({ god, ritual }) => (
          <RitualResultCard key={god.id} god={god} ritual={ritual} scale={scale} stepIndex={stepIndex} textRevealed={textRevealed} />
        ))}
      </div>

      <div style={{ flexShrink: 0, width: '100%', maxWidth: '1364px', padding: '0 84px' }}>
        <div style={{ height: '1px', backgroundColor: RESULT_DIVIDER }} />
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: '140px', padding: '43px 0' }}>
        <ResultResourceItem icon={c => <PrisonerIcon size={36} color={c} />} label="Prisoners" from={before.prisoners} to={resources.prisoners} active={stepIndex === 0} />
        <ResultResourceItem icon={c => <VolunteerIcon size={28} color={c} />} label="Volunteers" from={before.volunteers} to={resources.volunteers} active={stepIndex === 1} />
        <ResultResourceItem icon={c => <ChildrenIcon size={28} color={c} />} label="Children" from={before.children} to={resources.children} active={stepIndex === 2} />
        <ResultResourceItem icon={c => <VirginIcon size={28} color={c} />} label="Virgins" from={before.virgins} to={resources.virgins} active={stepIndex === 3} />
      </div>
    </motion.div>
  )
}

function ResultResourceItem({
  icon,
  label,
  from,
  to,
  active,
}: {
  icon: (color: string) => React.ReactNode
  label: string
  from: number
  to: number
  active: boolean
}) {
  const value = useCountTween(active, from, to, RESOURCE_STEP_DURATION)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '17.5px' }}>
      {icon(RESULT_FG)}
      <span style={{ fontFamily: FONTS.spectral, fontSize: '20px', fontWeight: 600, letterSpacing: '1.2px', color: RESULT_FG }}>{label}</span>
      <span style={{ fontFamily: FONTS.spectral, fontSize: '24px', letterSpacing: '1.44px', color: RESULT_FG }}>{value}</span>
    </div>
  )
}
