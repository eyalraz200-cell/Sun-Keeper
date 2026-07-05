import { useState, useRef, useLayoutEffect, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { COLORS, FONTS, FONT_SIZE, FONT_WEIGHT, EYE, RESOURCE_TOTALS, SPACING } from '../../tokens'
import { GODS, type God, type Ritual, type AngerLevel } from '../../data/gods'
import { GodSvg } from '../gods/GodSvg'
import { GodCard, CARD_WIDTH, outcomeEye, getSvgRaw } from '../gods/GodCard'
import { RitualCard } from '../ritual/RitualCard'
import { RitualResultScreen } from '../ritual/RitualResultScreen'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { RingedIcon } from '../icons/RingedIcon'
import { GridFour, ListBullets, CaretLeft } from '@phosphor-icons/react'

const AI_TOGGLE_RESERVE = '96px' // keeps the floating AI toggle button (54px circle, 12px from right edge) off the card grid

// Gods are grouped into sections by anger tier, in this fixed order.
const ANGER_TIERS: AngerLevel[] = ['high', 'medium', 'low', 'none']
const TIER_LABELS: Record<AngerLevel, string> = {
  high: 'Furious Gods',
  medium: 'Angry Gods',
  low: 'Uneasy Gods',
  none: 'Peaceful Gods',
}

const DISPLAY_GOD_COUNT = 24
// "Furious Gods" always shows exactly this many cards, but only 2 gods are actually high-anger.
const FURIOUS_TIER_SIZE = 8
const HIGH_GODS = GODS.filter(g => g.angerLevel === 'high')
const NON_HIGH_GODS = GODS.filter(g => g.angerLevel !== 'high')
const NONE_ANGER_GODS = GODS.filter(g => g.angerLevel === 'none')

let nextDupId = 0
function withDisplayId<T extends { id: string }>(g: T): T {
  return { ...g, id: `${g.id}-dup-${nextDupId++}` }
}

// Every real god appears at least once in its own true tier. On top of that, the Furious section
// is padded up to FURIOUS_TIER_SIZE by borrowing distinct lower-anger gods and re-skinning them as
// furious (angerLevel/angerColor overridden to 'high') — a display-only trick so every card in that
// section is a different god and none of them repeat, without actually duplicating Huitzilopochtli
// or Tlaloc. Any further padding needed to reach DISPLAY_GOD_COUNT is drawn entirely from the
// none-anger (Peaceful) gods, so real duplicate cards only ever land in the calmest tier.
// The Basic ritual's outcome is also re-skinned to Offended (orange) to match a real furious god's
// Basic ritual — otherwise it'd still show the borrowed god's own (calmer) real outcome color,
// which reads as broken/unfit next to the furious-red card it's now sitting on.
const furiousFillers = NON_HIGH_GODS.slice(0, Math.max(0, FURIOUS_TIER_SIZE - HIGH_GODS.length)).map(g =>
  withDisplayId({
    ...g,
    angerLevel: 'high' as AngerLevel,
    angerColor: ANGER.high,
    rituals: g.rituals.map((r, i) => (i === 0 ? { ...r, outcomeColor: ANGER.medium } : r)),
  })
)
const peacefulPaddingCount = DISPLAY_GOD_COUNT - GODS.length - furiousFillers.length
const DISPLAY_GODS = [
  ...GODS.map(g => withDisplayId(g)),
  ...furiousFillers,
  ...Array.from({ length: peacefulPaddingCount }, (_, i) => withDisplayId(NONE_ANGER_GODS[i % NONE_ANGER_GODS.length])),
]
// One bucket per non-empty anger tier, in ANGER_TIERS order — feeds the grid's section headers.
const DISPLAY_GOD_BUCKETS = ANGER_TIERS
  .map(level => ({ level, gods: DISPLAY_GODS.filter(g => g.angerLevel === level) }))
  .filter(bucket => bucket.gods.length > 0)
// Same gods, flattened into tier order (Furious → Angry → Uneasy → Peaceful) — feeds the
// list-view rail, which renders section titles inline rather than as separate grid sections.
const DISPLAY_GODS_BY_TIER = DISPLAY_GOD_BUCKETS.flatMap(bucket => bucket.gods)

type ResourceCost = { prisoners: number; volunteers: number; children: number; virgins: number; temples: number; greatTemples: number }
const ZERO_COST: ResourceCost = { prisoners: 0, volunteers: 0, children: 0, virgins: 0, temples: 0, greatTemples: 0 }

function sumRitualCost(chosenRituals: Record<string, string>): ResourceCost {
  const total = { ...ZERO_COST }
  for (const godId in chosenRituals) {
    const god = DISPLAY_GODS.find(g => g.id === godId)
    const ritual = god?.rituals.find(r => r.id === chosenRituals[godId])
    if (!ritual) continue
    total.prisoners += ritual.participants.prisoners
    total.volunteers += ritual.participants.volunteers
    total.children += ritual.participants.children
    total.virgins += ritual.participants.virgins
    if (ritual.sacredSite.name === 'Temple') total.temples += ritual.sacredSite.count
    if (ritual.sacredSite.name === 'Grand Temple') total.greatTemples += ritual.sacredSite.count
  }
  return total
}

// Thin vertical rule between two resource/site items — align-self:stretch fills whichever
// row it's placed in regardless of that row's own alignItems value.
// `fullBleed` pulls it past the parent's vertical padding so it reaches the container's
// full edge-to-edge height, using the page background color to read as a cut-through.
function ResourceDivider({ fullBleed }: { fullBleed?: boolean } = {}) {
  return <div style={{ flexShrink: 0, width: fullBleed ? '2px' : '1px', alignSelf: 'stretch', backgroundColor: fullBleed ? COLORS.black : COLORS.gray20, margin: fullBleed ? '-8px 0' : 0 }} />
}

const RESOURCE_COUNT_ANIM_DURATION = 1000

// Tweens the displayed value toward `value` over `duration`ms instead of snapping — used so
// docking/undocking a ritual reads as spending/refunding resources rather than a hard cut.
// Tracks the in-flight displayed value (not just the last committed target) so a reversal
// mid-animation (e.g. undock right after dock) resumes smoothly from wherever it currently is,
// instead of jumping back to the pre-animation start point.
function useAnimatedNumber(value: number, duration = RESOURCE_COUNT_ANIM_DURATION) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (displayRef.current === value) return
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const from = displayRef.current
    const to = value
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(from + (to - from) * eased)
      displayRef.current = current
      setDisplay(current)
      rafRef.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return display
}

function HomeResourceItem({ icon, label, count, total, cost, ritualActive, isFirst, isLast, onHoverChange }: { icon: (color: string) => React.ReactNode; label: string; count: number; total: number; cost?: number; ritualActive?: boolean; isFirst?: boolean; isLast?: boolean; onHoverChange?: (isHovered: boolean) => void }) {
  const displayCount = useAnimatedNumber(count)
  const affected = (cost ?? 0) > 0
  const dimmed = ritualActive && !affected
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = ritualActive ? (affected ? COLORS.white : 'rgba(255,255,255,0.25)') : COLORS.gray95
  const valueOpacity = ritualActive && affected ? 1 : 0.7
  // Only the pill's true outer corners round to match its own border-radius — an interior edge
  // (butting against a divider, not the pill's edge) stays square, or the fill reads as its own
  // separate rounded chip floating mid-pill instead of a flush segment of one shared shape.
  const fillRadius = `${isFirst ? '8px' : '0'} ${isLast ? '8px' : '0'} ${isLast ? '8px' : '0'} ${isFirst ? '8px' : '0'}`
  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      style={{ position: 'relative', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: '24px' }}
    >
      {/* Bleeds the full 24px gap on each side to reach the divider itself (the divider is its own
          flex child with a 24px gap on both sides, not a shared 12px split) and to the pill's own
          top/bottom edge — so the fill reads as its full segment between dividers, not a box
          hugging the icon/text with a sliver of the pill's base color still showing around it. */}
      <div style={{ position: 'absolute', top: '-8px', bottom: '-8px', left: '-24px', right: '-24px', borderRadius: fillRadius, backgroundColor: dimmed ? 'rgba(0,0,0,0.18)' : 'transparent', transition: 'background-color 0.2s ease' }} />
      <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon(labelColor)}</div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: valueOpacity, transition: 'color 0.2s ease, opacity 0.2s ease' }}>{displayCount}</span>
            <span style={{ color: valueColor, opacity: 0.25, transition: 'color 0.2s ease' }}> / {total}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeSiteItem({ icon, label, available, total, cost, ritualActive }: { icon: (color: string) => React.ReactNode; label: string; available: number; total: number; cost?: number; ritualActive?: boolean }) {
  const displayAvailable = useAnimatedNumber(available)
  const affected = (cost ?? 0) > 0
  const dimmed = ritualActive && !affected
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = ritualActive ? (affected ? COLORS.white : 'rgba(255,255,255,0.25)') : COLORS.gray95
  const valueOpacity = ritualActive && affected ? 1 : 0.7
  return (
    // Bare item, no shared pill behind it (unlike HomeResourceItem) — so unlike that one, dimming
    // here is text/ring-only, no dark fill rect to bleed toward a divider that doesn't exist.
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
      <RingedIcon size={44} borderColor={dimmed ? COLORS.gray20 : COLORS.gray30}>
        {icon(labelColor)}
      </RingedIcon>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: valueOpacity, transition: 'color 0.2s ease, opacity 0.2s ease' }}>{displayAvailable}</span>
            <span style={{ color: valueColor, opacity: 0.25, transition: 'color 0.2s ease' }}> / {total}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeBarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: COLORS.gray60, opacity: 0.46, marginBottom: '8px' }}>{children}</span>
  )
}

function HomeResourceBar({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, hoveredRitual, onResourceHover }: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number; resourceTotals?: typeof RESOURCE_TOTALS; hoveredRitual?: Ritual | null; onResourceHover?: (type: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null) => void }) {
  const ritualActive = !!hoveredRitual
  return (
    <div style={{ position: 'relative', zIndex: 1, flexShrink: 0, backgroundColor: COLORS.black, borderBottom: `1px solid ${COLORS.gray20}`, boxShadow: '0 4px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 48px 12px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Tributes</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px', width: '730px', borderRadius: '10px', backgroundColor: COLORS.gray15, padding: '8px 24px', overflow: 'hidden' }}>
          <HomeResourceItem icon={c => <PrisonerIcon size={28} color={c} />} label="Prisoners" count={prisoners} total={resourceTotals.prisoners} cost={hoveredRitual?.participants.prisoners} ritualActive={ritualActive} isFirst onHoverChange={hovered => onResourceHover?.(hovered ? 'prisoners' : null)} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VolunteerIcon size={28} color={c} />} label="Volunteers" count={volunteers} total={resourceTotals.volunteers} cost={hoveredRitual?.participants.volunteers} ritualActive={ritualActive} onHoverChange={hovered => onResourceHover?.(hovered ? 'volunteers' : null)} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <ChildrenIcon size={28} color={c} />} label="Children" count={children} total={resourceTotals.children} cost={hoveredRitual?.participants.children} ritualActive={ritualActive} onHoverChange={hovered => onResourceHover?.(hovered ? 'children' : null)} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VirginIcon size={28} color={c} />} label="Virgins" count={virgins} total={resourceTotals.virgins} cost={hoveredRitual?.participants.virgins} ritualActive={ritualActive} isLast onHoverChange={hovered => onResourceHover?.(hovered ? 'virgins' : null)} />
        </div>
      </div>
      <div style={{ flexShrink: 0, width: '40px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Ritual Sites</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', paddingTop: '8px' }}>
          <HomeSiteItem icon={c => <PyramidIcon size={24} color={c} />} label="Temple" available={temples} total={resourceTotals.temples} cost={hoveredRitual?.sacredSite.name === 'Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} />
          <HomeSiteItem icon={c => <PyramidIcon size={24} color={c} />} label="Grand Temple" available={greatTemples} total={resourceTotals.greatTemples} cost={hoveredRitual?.sacredSite.name === 'Grand Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} />
        </div>
      </div>
    </div>
  )
}

// Chip in the bottom action bar summarizing one resource type spent across all chosen
// rituals — only rendered for resource types the current selection actually costs.
function HomeActionBarPill({ icon, label, value }: { icon: (color: string) => React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', borderRadius: '8px', backgroundColor: COLORS.gray15 }}>
      {icon(COLORS.gray80)}
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: COLORS.gray80, letterSpacing: '1px', whiteSpace: 'nowrap' }}>{label} {value}</span>
    </div>
  )
}

// Bottom bar summarizing every chosen-but-not-yet-authorized ritual's total resource cost,
// plus the CTA that authorizes them all at once (triggers RitualResultScreen via
// onPerform). Always present on the overview screen's grid view — reads "0 Rituals Chosen"
// with no pills and a disabled CTA when nothing's been picked yet, rather than disappearing.
function HomeActionBar({ chosenCount, cost, onPerform, aiPanelOpen }: { chosenCount: number; cost: ResourceCost; onPerform: () => void; aiPanelOpen: boolean }) {
  const [hovered, setHovered] = useState(false)
  const hasChosen = chosenCount > 0
  const allPills: Array<{ key: string; icon: (color: string) => React.ReactNode; label: string; value: number }> = [
    { key: 'prisoners', icon: c => <PrisonerIcon size={16} color={c} />, label: 'Prisoners', value: cost.prisoners },
    { key: 'volunteers', icon: c => <VolunteerIcon size={16} color={c} />, label: 'Volunteers', value: cost.volunteers },
    { key: 'children', icon: c => <ChildrenIcon size={16} color={c} />, label: 'Children', value: cost.children },
    { key: 'virgins', icon: c => <VirginIcon size={16} color={c} />, label: 'Virgins', value: cost.virgins },
  ]
  const pills = allPills.filter(p => p.value > 0)

  return (
    // marginRight mirrors the scroll container's own reserve below — only needed when the AI
    // panel is actually open (331px-wide full-height right panel). The closed toggle button now
    // sits above this bar instead of beside it (see AiChat's `raised` prop), so it no longer
    // needs a horizontal reserve here.
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: COLORS.black, borderTop: '1px solid rgba(255,255,255,0.17)', padding: `${SPACING.md} ${SPACING.xl}`, marginRight: aiPanelOpen ? '331px' : 0, transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <span style={{ flexShrink: 0, fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.medium, color: hasChosen ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.35)', letterSpacing: '1px', whiteSpace: 'nowrap', transition: 'color 0.15s ease' }}>
        {chosenCount} {chosenCount === 1 ? 'Ritual' : 'Rituals'} Chosen
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {pills.map(p => <HomeActionBarPill key={p.key} icon={p.icon} label={p.label} value={p.value} />)}
      </div>
      <button
        onClick={hasChosen ? onPerform : undefined}
        onMouseEnter={() => hasChosen && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={!hasChosen}
        style={{
          flexShrink: 0,
          fontFamily: FONTS.spectral,
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.medium,
          color: !hasChosen ? 'rgba(255,255,255,0.3)' : hovered ? COLORS.white : 'rgba(255,255,255,0.72)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          background: hasChosen && hovered ? COLORS.gray15 : 'transparent',
          border: `1px solid ${hasChosen ? 'rgba(255,255,255,0.71)' : 'rgba(255,255,255,0.25)'}`,
          borderRadius: '4px',
          padding: `${SPACING.sm} ${SPACING.md}`,
          boxShadow: hasChosen ? '0 0 13.6px rgba(0,0,0,1)' : 'none',
          cursor: hasChosen ? 'pointer' : 'default',
          transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
        }}
      >
        Perform All Chosen Rituals
      </button>
    </div>
  )
}

const FLIP_DURATION = 900
const DRAWER_CLOSE_DURATION = 260
const SCROLL_TOP_GAP = 24

// Drag-and-drop tuning — a phase state machine with setTimeouts matched to CSS transition
// durations to commit state once the animation finishes, with a forgiving drop margin.
const DOCK_MARGIN = 48
const RETURN_DURATION = 320
const DOCK_DURATION = 260
const RITUAL_CARD_WIDTH = 245
const RITUAL_CARD_HEIGHT = 391 // measured natural height of a rendered RitualCard (fixed 4-pill layout, doesn't vary by ritual) — drop-zone matches this exactly, same as the dragged card
const DROP_ZONE_WIDTH = RITUAL_CARD_WIDTH
const DROP_ZONE_HEIGHT = RITUAL_CARD_HEIGHT
const FACE_HEIGHT = 300

function HomeGodDetailPanel({ god, onBack, onChoose, onUnchoose, onRitualHoverChange, originRect, isClosing, onCloseComplete, scrollContainerRef, chosenRitualId, isActive = true, highlightParticipantType }: { god: God; onBack: () => void; onChoose: (ritualId: string) => void; onUnchoose: () => void; onRitualHoverChange: (ritual: Ritual | null) => void; originRect: DOMRect | null; isClosing: boolean; onCloseComplete: () => void; scrollContainerRef: React.RefObject<HTMLDivElement | null>; chosenRitualId?: string | null; isActive?: boolean; highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null }) {
  // Widened to match outcomeEye()'s return type — EYE itself is `as const` (a literal-typed
  // union per level), which would otherwise stop `to`/`from` below from ever holding an
  // outcomeEye() result once a ritual is docked.
  const baseEye: { color: string; weight: number } = EYE[god.angerLevel as AngerLevel]
  const chosenRitual = chosenRitualId ? god.rituals.find(r => r.id === chosenRitualId) ?? null : null
  // Eyes reflect the DOCKED ritual's outcome, not whatever's under the pointer — initialize from
  // chosenRitual (already-docked on mount, e.g. re-opening this god's panel) with from===to so
  // there's no spurious animation on first paint, only on an actual dock/undock afterward.
  const initialEye = chosenRitual ? outcomeEye(chosenRitual.outcomeColor) : baseEye
  const [eyeAnim, setEyeAnim] = useState<{ from: typeof baseEye; to: typeof baseEye; key: number; delay: number } | null>(
    chosenRitual ? { from: initialEye, to: initialEye, key: 0, delay: 0 } : null
  )
  const currentEyeRef = useRef(initialEye)
  // Same "animate the fresh markup, don't rely on a CSS transition" approach as eyeAnim above,
  // applied to the face's body fill — brightens when a ritual gets docked, dims back down when
  // it's pulled back out.
  const BODY_COLOR_DOCKED = COLORS.gray80
  const BODY_COLOR_UNDOCKED = COLORS.gray60
  const initialBodyColor = chosenRitual ? BODY_COLOR_DOCKED : BODY_COLOR_UNDOCKED
  const [bodyColorAnim, setBodyColorAnim] = useState<{ from: string; to: string; key: number } | null>(null)
  const currentBodyColorRef = useRef(initialBodyColor)
  const panelRef = useRef<HTMLDivElement>(null)
  // Hovering the face/name area (outside the ritual card) previews the same brighter look
  // GodCard uses for its own highlighted state, and clicking it returns to the overview grid.
  const [isFaceHovered, setIsFaceHovered] = useState(false)
  // Caches the one-time scroll delta below — unlike the transform reset, scrolling the container
  // is a side effect that persists across StrictMode's double-invoke, so it must run at most once.
  const scrollAdjustRef = useRef<number | null>(null)

  // Drag state — one machine handles both directions around the same target rect (the
  // drop-zone): dragging a row card in (dock) and dragging the docked card out (undock).
  const [dragRitualId, setDragRitualId] = useState<string | null>(null)
  const [dragOrigin, setDragOrigin] = useState<'row' | 'dropzone' | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [dragPhase, setDragPhase] = useState<'idle' | 'dragging' | 'returning' | 'docking' | 'undocking'>('idle')
  const [isOverDropZone, setIsOverDropZone] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const rowSlotRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dragStartRef = useRef<{ originLeft: number; originTop: number; pointerDx: number; pointerDy: number } | null>(null)

  // Pointer capture routes all move/up events to the card that started the drag, but the
  // cursor icon itself follows whatever's under the pointer — which, mid-drag, is wherever the
  // ghost happens to be, not necessarily an element with cursor:grabbing set. Forcing it on
  // <body> for the duration of the drag keeps the "grabbing fist" showing everywhere.
  useEffect(() => {
    if (dragPhase !== 'dragging') return
    document.body.style.cursor = 'grabbing'
    return () => { document.body.style.cursor = '' }
  }, [dragPhase])

  const isPointOverDropZone = (x: number, y: number) => {
    const zone = dropZoneRef.current
    if (!zone) return false
    const r = zone.getBoundingClientRect()
    return x >= r.left - DOCK_MARGIN && x <= r.right + DOCK_MARGIN && y >= r.top - DOCK_MARGIN && y <= r.bottom + DOCK_MARGIN
  }

  // Only pointerdown is a per-card React handler (it has to start on the specific card the user
  // pressed). Move/up/cancel are handled globally on window (see the effect below) rather than
  // via setPointerCapture + per-element handlers — capture routed through a <button> (RitualCard's
  // root element) turned out to be unreliable: the browser would occasionally release capture or
  // swallow the terminating pointerup mid-drag (button focus/active-state handling stepping on
  // it), leaving dragPhase stuck at 'dragging' forever with the card visually glued to the cursor
  // and never dropping. A window-level listener doesn't depend on capture surviving the whole
  // gesture — it fires on whatever the browser reports the release against, always.
  const handleDragPointerDown = (ritualId: string, origin: 'row' | 'dropzone') => (e: React.PointerEvent) => {
    if (dragPhase !== 'idle') return
    const el = origin === 'row' ? rowSlotRefs.current[ritualId] : dropZoneRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragStartRef.current = { originLeft: rect.left, originTop: rect.top, pointerDx: e.clientX - rect.left, pointerDy: e.clientY - rect.top }
    setDragRitualId(ritualId)
    setDragOrigin(origin)
    setDragPos({ x: rect.left, y: rect.top })
    setDragPhase('dragging')
    // Drives the resource-bar preview explicitly from the drag lifecycle instead of relying on
    // this card's own onMouseLeave, which may not fire reliably once the cursor moves off it.
    onRitualHoverChange(god.rituals.find(r => r.id === ritualId) ?? null)
  }

  useEffect(() => {
    if (dragPhase !== 'dragging') return

    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      setDragPos({ x: e.clientX - dragStartRef.current.pointerDx, y: e.clientY - dragStartRef.current.pointerDy })
      setIsOverDropZone(isPointOverDropZone(e.clientX, e.clientY))
    }

    const onUp = (e: PointerEvent) => {
      if (!dragRitualId || !dragOrigin) return
      const overZone = isPointOverDropZone(e.clientX, e.clientY)
      setIsOverDropZone(false)

      const settle = () => {
        setDragPhase('idle')
        setDragRitualId(null)
        setDragOrigin(null)
        setDragPos(null)
        // Preview highlight held for the whole drag (see handleDragPointerDown) only auto-clears
        // here if the pointer already left the drop-zone before releasing. If it's still over the
        // zone (a successful dock, or a dropzone-card dropped back into itself), the cursor is
        // still on the ritual — leave the highlight up and let hover-out clear it later.
        if (!overZone) onRitualHoverChange(null)
      }

      if (dragOrigin === 'row' && overZone && dropZoneRef.current) {
        const r = dropZoneRef.current.getBoundingClientRect()
        setDragPos({ x: r.left, y: r.top })
        setDragPhase('docking')
        const ritualId = dragRitualId
        const dockedRitual = god.rituals.find(r => r.id === ritualId) ?? null
        setTimeout(() => { onChoose(ritualId); setEyesTo(dockedRitual); setBodyColorTo(true); settle() }, DOCK_DURATION)
      } else if (dragOrigin === 'dropzone' && !overZone) {
        setDragPhase('undocking')
        setTimeout(() => { onUnchoose(); setEyesTo(null); setBodyColorTo(false); settle() }, DOCK_DURATION)
      } else {
        // Either a row card missed the drop-zone, or the docked card was dropped back inside it —
        // both cases just snap back to where the drag started, no state change.
        setDragPhase('returning')
        setTimeout(settle, RETURN_DURATION)
      }
    }

    // A pointercancel (window/tab loses focus mid-drag, the OS intercepts the gesture, browser
    // scroll-to-refresh kicks in, etc.) never fires pointerup — without handling it separately,
    // dragPhase would stay stuck at 'dragging' forever with nothing left to call settle().
    const onCancel = () => {
      setIsOverDropZone(false)
      onRitualHoverChange(null)
      setDragPhase('returning')
      setTimeout(() => {
        setDragPhase('idle')
        setDragRitualId(null)
        setDragOrigin(null)
        setDragPos(null)
      }, RETURN_DURATION)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [dragPhase, dragRitualId, dragOrigin])

  // FLIP: start the panel transformed to exactly match the clicked card's grid position/size,
  // then animate that transform away to none so it visibly travels+grows into place.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !originRect || isClosing) return

    // Reset first so all measurements below reflect natural layout — StrictMode double-invokes
    // this effect in dev, and without this reset the 2nd run would measure its own scaled-down result.
    panel.style.transition = 'none'
    panel.style.transform = 'none'

    // Scroll the panel to the top of the viewport first — the before/after grid split stays put,
    // only the scroll position changes — then correct originRect by the same delta so the FLIP
    // still visually starts from where the clicked card was before this scroll happened.
    const container = scrollContainerRef.current
    if (container && scrollAdjustRef.current === null) {
      const containerRect = container.getBoundingClientRect()
      const panelRectBeforeScroll = panel.getBoundingClientRect()
      const prevScrollTop = container.scrollTop
      container.scrollTop = prevScrollTop + (panelRectBeforeScroll.top - containerRect.top - SCROLL_TOP_GAP)
      scrollAdjustRef.current = container.scrollTop - prevScrollTop
    }
    const actualDelta = scrollAdjustRef.current ?? 0
    const adjustedOriginRect = new DOMRect(originRect.left, originRect.top - actualDelta, originRect.width, originRect.height)

    const panelRect = panel.getBoundingClientRect()
    const dx = adjustedOriginRect.left - panelRect.left
    const dy = adjustedOriginRect.top - panelRect.top
    const sx = adjustedOriginRect.width / panelRect.width
    const sy = adjustedOriginRect.height / panelRect.height
    panel.style.transformOrigin = 'top left'
    panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    panel.getBoundingClientRect() // force reflow so the "from" transform commits before we animate away from it
    requestAnimationFrame(() => {
      panel.style.transition = `transform ${FLIP_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
      panel.style.transform = 'translate(0px, 0px) scale(1, 1)'
    })
  }, [originRect])

  // Reverse sequence: first close the ritual "drawer" (mirrors the entrance wipe), then once the
  // shell is empty, reverse-FLIP it back down to the origin card's position/size.
  const [drawerClosing, setDrawerClosing] = useState(false)
  useLayoutEffect(() => {
    if (!isClosing) return
    setDrawerClosing(true)
    const flipTimeout = setTimeout(() => {
      const panel = panelRef.current
      if (!panel || !originRect) {
        onCloseComplete()
        return
      }
      const panelRect = panel.getBoundingClientRect()
      const dx = originRect.left - panelRect.left
      const dy = originRect.top - panelRect.top
      const sx = originRect.width / panelRect.width
      const sy = originRect.height / panelRect.height
      panel.style.transformOrigin = 'top left'
      panel.style.transition = `transform ${FLIP_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
      panel.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    }, DRAWER_CLOSE_DURATION)
    const closeTimeout = setTimeout(onCloseComplete, DRAWER_CLOSE_DURATION + FLIP_DURATION)
    return () => {
      clearTimeout(flipTimeout)
      clearTimeout(closeTimeout)
    }
  }, [isClosing])

  // Hovering only previews the resource-bar highlight (see onRitualHoverChange) — the eyes stay
  // put until a ritual is actually dropped; see setEyesTo, called from the dock/undock handlers.
  // Ignored mid-drag: pointer capture means this card's own mouseenter/mouseleave can fire at
  // arbitrary points during a drag, which would otherwise stomp the drag-driven preview set by
  // handleDragPointerDown/settle.
  const handleRitualHover = (ritual: Ritual, hovered: boolean) => {
    if (dragPhase !== 'idle') return
    onRitualHoverChange(hovered ? ritual : null)
  }

  const setEyesTo = (ritual: Ritual | null) => {
    const target = ritual ? outcomeEye(ritual.outcomeColor) : baseEye
    const from = currentEyeRef.current
    currentEyeRef.current = target
    setEyeAnim(prev => ({ from, to: target, key: (prev?.key ?? 0) + 1, delay: 0 }))
  }

  const setBodyColorTo = (docked: boolean) => {
    const target = docked ? BODY_COLOR_DOCKED : BODY_COLOR_UNDOCKED
    const from = currentBodyColorRef.current
    currentBodyColorRef.current = target
    setBodyColorAnim(prev => ({ from, to: target, key: (prev?.key ?? 0) + 1 }))
  }

  const dragGhostRitual = dragRitualId ? god.rituals.find(r => r.id === dragRitualId) ?? null : null
  // Two tiers: brighter the whole time a ritual card is being dragged (any target is potentially
  // droppable), brighter still once the pointer is actually over this zone (the imminent-drop cue).
  const isDragging = dragPhase === 'dragging'
  const zoneHighlighted = isDragging && isOverDropZone
  const zoneFill = zoneHighlighted ? COLORS.gray20 : isDragging ? COLORS.gray15 : COLORS.black
  const zoneBorderColor = zoneHighlighted ? COLORS.white : isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)'
  const zoneTextColor = zoneHighlighted ? COLORS.gray95 : isDragging ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'

  // Wipes in after the FLIP move+grow lands, same choreography applied to both the drop-zone
  // (dashed border included) and the candidate row below — the face card is a separate box
  // that isn't part of this wipe, so its own border stays static throughout.
  const drawerRevealStyle: React.CSSProperties = drawerClosing
    ? { opacity: 0, clipPath: 'inset(-60px 100% -60px -60px)', transition: `opacity ${DRAWER_CLOSE_DURATION}ms ease-in, clip-path ${DRAWER_CLOSE_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)` }
    : { animation: `homeDetailDrawerReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) ${FLIP_DURATION}ms both` }

  return (
    <div ref={panelRef} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 24px 0', padding: '16px 24px 24px' }}>
      <div style={{ display: 'flex', width: 'fit-content', gap: '24px', backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.gray30}`, borderRadius: '10px', padding: '16px' }}>
        <div
          onClick={onBack}
          onMouseEnter={() => setIsFaceHovered(true)}
          onMouseLeave={() => setIsFaceHovered(false)}
          style={{ flexShrink: 0, width: '320px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}
        >
          <div
            style={{
              flexShrink: 0,
              width: '100%',
              textAlign: 'center',
              ...(drawerClosing
                ? { opacity: 0, transform: 'translateY(-10px)', transition: `opacity ${DRAWER_CLOSE_DURATION}ms ease-in, transform ${DRAWER_CLOSE_DURATION}ms ease-in` }
                : { animation: `homeDetailHeaderEnter 280ms cubic-bezier(0.23, 1, 0.32, 1) ${FLIP_DURATION - 80}ms both` }),
            }}
          >
            {/* Wraps just the name line (not the subtitle below) so the chevron's vertical center,
                driven by this row's own height, always lines up with the name specifically. */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isFaceHovered ? COLORS.gray95 : COLORS.gray30}`,
                }}
              >
                <CaretLeft size={16} weight="bold" color={isFaceHovered ? COLORS.gray95 : COLORS.gray30} />
              </div>
              <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: 400, color: isActive ? COLORS.gray60 : COLORS.gray15, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.15s ease' }}>{god.name}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontFamily: FONTS.spectral, fontSize: '16px', color: isActive ? '#909090' : COLORS.gray15, transition: 'color 0.15s ease' }}>{god.subtitle}</p>
          </div>
          <div style={{ flexShrink: 0, width: '100%', height: `${FACE_HEIGHT}px`, borderRadius: '10px', overflow: 'hidden' }}>
            <GodSvg
              svgRaw={getSvgRaw(god.id)}
              angerLevel={god.angerLevel}
              bodyColor={isActive ? currentBodyColorRef.current : COLORS.gray15}
              bodyColorAnimation={isActive && bodyColorAnim ? { fromColor: bodyColorAnim.from, toColor: bodyColorAnim.to, duration: 0.8, id: `body-${bodyColorAnim.key}` } : undefined}
              instanceId={`detail-${god.id}`}
              eyeAnimation={eyeAnim ? { fromColor: eyeAnim.from.color, fromWeight: eyeAnim.from.weight, toColor: eyeAnim.to.color, toWeight: eyeAnim.to.weight, delay: eyeAnim.delay, duration: 1, id: `eye-${eyeAnim.key}` } : undefined}
            />
          </div>
        </div>
        {/* Drop-zone — a permanent dashed base layer with the docked ritual (if any) layered on
            top; dimming the docked card during an undock-drag naturally reveals the dashed base
            underneath, no extra state needed. */}
        <div ref={dropZoneRef} style={{ flexShrink: 0, width: `${DROP_ZONE_WIDTH}px`, height: `${DROP_ZONE_HEIGHT}px`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', ...drawerRevealStyle }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: zoneFill,
              border: `1.75px dashed ${zoneBorderColor}`,
              borderRadius: '10px',
              // Hidden once a ritual is docked — it's redundant against the card's own border at
              // matching size, and would otherwise peek through as a faint outline. Still shown
              // while dragging the docked card back out (dimming it reveals this base as feedback
              // that it's coming loose), and fades in the same way if the drag misses its target.
              opacity: !chosenRitual || (dragOrigin === 'dropzone' && dragRitualId === chosenRitual.id && dragPhase !== 'idle') ? 1 : 0,
              transition: 'background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
            }}
          />
          {!chosenRitual && (
            <span
              style={{
                position: 'relative',
                maxWidth: '70%',
                textAlign: 'center',
                fontFamily: FONTS.spectral,
                fontSize: FONT_SIZE.md,
                fontWeight: FONT_WEIGHT.light,
                color: zoneTextColor,
                pointerEvents: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              Drag and drop an appeasement ritual
            </span>
          )}
          {chosenRitual && (
            <div
              onPointerDown={handleDragPointerDown(chosenRitual.id, 'dropzone')}
              style={{
                position: 'relative',
                width: `${RITUAL_CARD_WIDTH}px`,
                cursor: 'grab',
                touchAction: 'none',
                opacity: dragOrigin === 'dropzone' && dragRitualId === chosenRitual.id && dragPhase !== 'idle' ? 0.18 : 1,
              }}
            >
              <RitualCard
                ritual={chosenRitual}
                isSelected={false}
                onClick={() => {}}
                onHoverChange={hovered => handleRitualHover(chosenRitual, hovered)}
                outcomeBorder
                dropShadow={false}
                highlight={!!highlightParticipantType && chosenRitual.participants[highlightParticipantType] > 0}
              />
            </div>
          )}
        </div>
      </div>
      {/* Candidate row — every one of the god's rituals, in a fixed slot each. Drag one into the
          drop-zone above to choose it; its own slot here goes vacant (invisible, but still
          occupying its space) rather than closing up, so the other cards never have to move.
          Drag the docked card back out to bring it back to its same slot. */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px', ...drawerRevealStyle }}>
        {god.rituals.map(ritual => {
          const isChosen = ritual.id === chosenRitualId
          return (
            <div
              key={ritual.id}
              ref={el => { rowSlotRefs.current[ritual.id] = el }}
              onPointerDown={isChosen ? undefined : handleDragPointerDown(ritual.id, 'row')}
              style={{
                width: `${RITUAL_CARD_WIDTH}px`,
                flexShrink: 0,
                cursor: isChosen ? 'default' : 'grab',
                touchAction: 'none',
                pointerEvents: isChosen ? 'none' : 'auto',
                opacity: isChosen ? 0 : dragOrigin === 'row' && dragRitualId === ritual.id && dragPhase !== 'idle' ? 0.18 : 1,
              }}
            >
              <RitualCard
                ritual={ritual}
                isSelected={false}
                onClick={() => {}}
                onHoverChange={hovered => handleRitualHover(ritual, hovered)}
                outcomeBorder
                highlight={!!highlightParticipantType && ritual.participants[highlightParticipantType] > 0}
              />
            </div>
          )
        })}
      </div>
      {dragGhostRitual && dragPos && createPortal(
        // Portaled to document.body — panelRef gets a non-'none' `transform` set directly on its
        // DOM node once the FLIP entrance animation settles (even at identity, translate(0,0)
        // scale(1,1)), and CSS gives any transformed ancestor a new containing block for
        // position:fixed descendants. Left nested inside panelRef, this ghost would track
        // relative to the panel's box instead of the viewport.
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${RITUAL_CARD_WIDTH}px`,
            transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
            transition:
              dragPhase === 'returning' ? `transform ${RETURN_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
              : dragPhase === 'docking' ? `transform ${DOCK_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)`
              : dragPhase === 'undocking' ? `opacity ${DOCK_DURATION}ms ease-in`
              : 'none',
            opacity: dragPhase === 'undocking' ? 0 : 1,
            pointerEvents: 'none',
            zIndex: 4001,
            ...(dragPhase === 'returning' && dragStartRef.current
              ? { transform: `translate(${dragStartRef.current.originLeft}px, ${dragStartRef.current.originTop}px)` }
              : {}),
          }}
        >
          <RitualCard ritual={dragGhostRitual} isSelected={false} onClick={() => {}} outcomeBorder forcePopped />
        </div>,
        document.body
      )}
      <style>{`
        @keyframes homeDetailHeaderEnter {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* The left-to-right wipe only needs to animate the RIGHT inset (100% -> hidden, 0 ->
           revealed) — top/bottom/left aren't part of the motion. Keeping those at a generous
           negative inset (instead of 0) throughout means the clip-path this leaves behind
           after the animation ends (fill-mode: both keeps the final frame forever) doesn't
           permanently clip the ritual cards' own box-shadow flush against their own edges. */
        @keyframes homeDetailDrawerReveal {
          from { opacity: 0; clip-path: inset(-60px 100% -60px -60px); }
          to { opacity: 1; clip-path: inset(-60px -60px -60px -60px); }
        }
      `}</style>
    </div>
  )
}

const ESTIMATED_PANEL_HEIGHT = 650

const NOOP = () => {}

// Real spacing between stacked panels — must stay >= the trailing cover's marginTop below, or
// the cover starts before the next panel actually does and its content peeks through the gap.
const FREE_CAROUSEL_GAP = 40
const FREE_CAROUSEL_WINDOW_RADIUS = 2
// Total accumulated wheel deltaY needed to commit one step. Low enough that a single light
// scroll tick (a mouse-wheel notch is ~100, already well past this alone) or a short trackpad
// flick immediately trips it — deliberately not proportional to delta size, so a harder/faster
// scroll still can never skip past more than one god at a time (see handleWheel's lock).
const FREE_SCROLL_STEP_THRESHOLD = 30
const FREE_SNAP_DURATION = 1100

// One god at a time: each wheel gesture commits exactly one step (see handleWheel's accumulator
// + lock), animated with a real CSS transition — not the old continuous 1:1 finger-tracking,
// which let a hard fling blow past several gods and, worse, let light scrolls that never crossed
// its rounding threshold do nothing at all.
function GodFreeCarousel({ gods, scrollPos, onScrollPosChange, onSettledIndexChange, originRect, originGodId, chosenRituals, onChooseRitual, onUnchooseRitual, onRitualHoverChange, onBack, highlightParticipantType }: {
  gods: God[]
  scrollPos: number
  onScrollPosChange: (pos: number) => void
  onSettledIndexChange: (index: number) => void
  originRect: DOMRect | null
  originGodId: string | null
  chosenRituals: Record<string, string>
  onChooseRitual: (godId: string, ritualId: string) => void
  onUnchooseRitual: (godId: string) => void
  onRitualHoverChange: (ritual: Ritual | null) => void
  onBack: () => void
  highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const inertScrollRef = useRef<HTMLDivElement>(null)
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({})
  const roRef = useRef<ResizeObserver | null>(null)
  const observedRef = useRef<Map<string, HTMLElement>>(new Map())
  // Accumulates wheel deltaY until FREE_SCROLL_STEP_THRESHOLD is crossed, then commits exactly
  // one step and resets to 0. wheelLockRef blocks (and drops, rather than queues) all wheel input
  // for the duration of that step's transition, so a continued flick can't stack up extra steps.
  const wheelAccumRef = useRef(0)
  const wheelLockRef = useRef(false)
  const wheelLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // isSnapping used to only flip true from handleWheel, so a scrollPos change coming from
  // anywhere else (e.g. clicking a different row in the left rail, which drives scrollPos from
  // the parent) never got the transform transition — the carousel jumped instantly instead of
  // sliding. It only needs to be false for the very first paint (so mount doesn't animate in from
  // nowhere); every position change after that, regardless of source, should slide. A "has
  // mounted" ref flipped after the first paint covers both wheel- and click-driven navigation.
  const hasMountedRef = useRef(false)
  const isSnapping = hasMountedRef.current
  useLayoutEffect(() => {
    hasMountedRef.current = true
  }, [])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement
        const godId = target.dataset.godId
        if (godId) {
          const h = target.offsetHeight
          setPanelHeights(prev => (prev[godId] === h ? prev : { ...prev, [godId]: h }))
        }
      }
    })
    roRef.current = ro
    return () => ro.disconnect()
  }, [])

  const registerPanelEl = (godId: string, el: HTMLDivElement | null) => {
    const ro = roRef.current
    if (!ro) return
    const prev = observedRef.current.get(godId)
    if (prev && prev !== el) {
      ro.unobserve(prev)
      observedRef.current.delete(godId)
    }
    if (el) {
      el.dataset.godId = godId
      ro.observe(el)
      observedRef.current.set(godId, el)
    }
  }

  const heightOf = (index: number) => panelHeights[gods[index].id] ?? ESTIMATED_PANEL_HEIGHT

  // Cumulative top-edge offset of a (possibly fractional) virtual index, measured from index 0 —
  // used as a common ruler so any two positions (integer or fractional) can be placed relative to
  // each other, which is what lets the carousel track a position strictly between two gods.
  const cumulativeTop = (pos: number) => {
    const clamped = Math.max(0, Math.min(gods.length - 1, pos))
    const base = Math.floor(clamped)
    const frac = clamped - base
    let top = 0
    for (let i = 0; i < base; i++) top += heightOf(i) + FREE_CAROUSEL_GAP
    top += frac * (heightOf(base) + FREE_CAROUSEL_GAP)
    return top
  }

  const roundedIndex = Math.max(0, Math.min(gods.length - 1, Math.round(scrollPos)))

  useEffect(() => {
    onSettledIndexChange(roundedIndex)
  }, [roundedIndex])

  // roundedIndex flips to the target god the instant a scroll is triggered (it has to, so the
  // CSS transform transition below animates toward it) — but HomeGodDetailPanel's `isActive`
  // prop drives the face/name/subtitle color directly (no transition matching the 1100ms slide).
  // The new (incoming) god should brighten immediately — it's already becoming the hero, and
  // waiting until it's done sliding in reads as if it were dark the whole way up. The outgoing
  // god should *also* stay bright for the same duration instead of snapping dark the instant the
  // scroll starts — otherwise it visibly darkens before it's actually left. lingerUntilRef tracks
  // the previous roundedIndex for exactly one transition's worth of time so both the outgoing and
  // incoming panel read as active while they're actually moving, and only the true stragglers
  // (untouched by this transition) stay dim throughout.
  //
  // The onset (marking the outgoing index as lingering) is done as a plain ref mutation *during
  // render*, not inside an effect. An effect fires one commit late: React would first render with
  // the outgoing panel already dark, paint nothing (React 18 batches this fine), but GodSvg still
  // sees a genuinely different `bodyColor` across those two renders and — since it draws via
  // dangerouslySetInnerHTML — tears down and rebuilds its entire SVG subtree on each "changed
  // props" render, which is the flash: a real DOM node replacement even though the color it
  // settles on is identical to before. Doing the bookkeeping synchronously in the render body
  // means roundedIndex and the linger set are always consistent within a single render — GodSvg
  // never sees the wrong intermediate value, so it never re-renders at all. Only the *reversion*
  // (dropping the lingering index once the transition truly ends) needs a real timer/re-render,
  // since that's a deliberate, one-time settle rather than a same-tick correction.
  const prevRoundedRef = useRef(roundedIndex)
  const lingerUntilRef = useRef<Map<number, number>>(new Map())
  const [, bumpLingerTick] = useState(0)
  if (prevRoundedRef.current !== roundedIndex) {
    const prev = prevRoundedRef.current
    prevRoundedRef.current = roundedIndex
    lingerUntilRef.current.set(prev, performance.now() + FREE_SNAP_DURATION)
  }
  useEffect(() => {
    const now = performance.now()
    const pending = Array.from(lingerUntilRef.current.values()).map(until => until - now).filter(ms => ms > 0)
    if (pending.length === 0) return
    const t = setTimeout(() => {
      const cutoff = performance.now()
      for (const [idx, until] of lingerUntilRef.current) {
        if (until <= cutoff) lingerUntilRef.current.delete(idx)
      }
      bumpLingerTick(v => v + 1)
    }, Math.max(...pending) + 16)
    return () => clearTimeout(t)
  }, [roundedIndex])
  const isLingering = (index: number) => (lingerUntilRef.current.get(index) ?? 0) > performance.now()

  // windowIndices only needs to span FREE_CAROUSEL_WINDOW_RADIUS around scrollPos for a
  // single-step wheel move — the old and new position are already within radius of each other,
  // so every panel that needs to slide is already mounted. Picking a row far down the list (via
  // the left rail) can jump scrollPos by many gods at once, though: with only the narrow window,
  // the target god's panel would mount already at rest on its very first render (nothing to
  // transition from) and everything in between would never render at all — no slide, just a pop.
  // transitSpanRef captures the full old->new range on the render where scrollPos jumps (a plain
  // ref mutation during render, same safe pattern as lingerUntilRef above — no extra render pass,
  // so the panels in that range are already mounted with correct positions by the very first
  // render after the jump, ready for the CSS transform transition to carry them the whole way).
  // It's held for one transition's worth of time, then released so the window shrinks back down
  // once things have actually settled.
  const prevScrollPosForWindowRef = useRef(scrollPos)
  const transitSpanRef = useRef<{ start: number; end: number } | null>(null)
  const [, bumpWindowTick] = useState(0)
  if (prevScrollPosForWindowRef.current !== scrollPos) {
    const prevPos = prevScrollPosForWindowRef.current
    prevScrollPosForWindowRef.current = scrollPos
    transitSpanRef.current = { start: Math.min(prevPos, scrollPos), end: Math.max(prevPos, scrollPos) }
  }
  useEffect(() => {
    if (!transitSpanRef.current) return
    const t = setTimeout(() => {
      transitSpanRef.current = null
      bumpWindowTick(v => v + 1)
    }, FREE_SNAP_DURATION + 50)
    return () => clearTimeout(t)
  }, [scrollPos])
  const span = transitSpanRef.current
  const windowStart = Math.max(0, Math.floor(span ? span.start : scrollPos) - FREE_CAROUSEL_WINDOW_RADIUS)
  const windowEnd = Math.min(gods.length - 1, Math.ceil(span ? span.end : scrollPos) + FREE_CAROUSEL_WINDOW_RADIUS)
  const windowIndices: number[] = []
  for (let i = windowStart; i <= windowEnd; i++) windowIndices.push(i)

  const anchorTop = cumulativeTop(scrollPos)
  // Anchored near the top of the carousel viewport (close to the resource bar) rather than
  // vertically centered — HomeGodDetailPanel's own 24px top margin already provides the breathing
  // room, so the active panel's top edge lands just below the header area.
  const baseOffset = 0

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    // Mid-step: drop this event entirely rather than queue it — the lock releasing only after
    // the transition finishes is what guarantees a fast/continued flick still lands on exactly
    // the next god, never two or three.
    if (wheelLockRef.current) return

    wheelAccumRef.current += e.deltaY
    if (Math.abs(wheelAccumRef.current) < FREE_SCROLL_STEP_THRESHOLD) return

    const direction = wheelAccumRef.current > 0 ? 1 : -1
    wheelAccumRef.current = 0
    const current = Math.round(scrollPos)
    const next = Math.max(0, Math.min(gods.length - 1, current + direction))
    if (next === current) return // already at the first/last god — nothing to step to

    wheelLockRef.current = true
    onScrollPosChange(next)
    wheelLockTimeoutRef.current = setTimeout(() => {
      wheelLockRef.current = false
    }, FREE_SNAP_DURATION)
  }

  useEffect(() => () => {
    if (wheelLockTimeoutRef.current) clearTimeout(wheelLockTimeoutRef.current)
  }, [])

  return (
    <div ref={viewportRef} onWheel={handleWheel} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {windowIndices.map(index => {
        const god = gods[index]
        const isActive = index === roundedIndex
        const isVisuallyActive = index === roundedIndex || isLingering(index)
        const top = baseOffset + (cumulativeTop(index) - anchorTop)
        return (
          <div
            key={god.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              // Real, non-overlapping stacked positions (cumulativeTop already accounts for every
              // panel's real measured height + FREE_CAROUSEL_GAP) — one continuous list, each god's
              // panel sitting directly below the last, so neighbors genuinely peek in as you scroll
              // past instead of the active one being the only thing ever visible. Paint order just
              // follows list order; nothing here needs to outrank anything else since nothing overlaps.
              zIndex: index,
              // translate3d over translateY: promotes this to its own GPU compositing layer, so
              // the animation doesn't share a paint pass with (and stutter from) sibling panels.
              transform: `translate3d(0, ${top}px, 0)`,
              willChange: 'transform',
              pointerEvents: isActive ? 'auto' : 'none',
              // ease-in-out over the old cubic-bezier(0.23,1,0.32,1) — that curve's control points
              // front-load almost all the motion into the first ~20% of the duration (near-instant
              // snap, then a long slow tail), which reads as a jerky jump-then-crawl rather than one
              // continuous glide. A symmetric ease-in-out actually feels smooth across the full
              // (now much longer, 1100ms) duration.
              transition: isSnapping ? `transform ${FREE_SNAP_DURATION}ms ease-in-out` : 'none',
            }}
          >
            <div ref={el => registerPanelEl(god.id, el)} style={{ display: 'flex', justifyContent: 'center' }}>
              <HomeGodDetailPanel
                god={god}
                onBack={onBack}
                onChoose={ritualId => onChooseRitual(god.id, ritualId)}
                onUnchoose={() => onUnchooseRitual(god.id)}
                onRitualHoverChange={onRitualHoverChange}
                originRect={god.id === originGodId ? originRect : null}
                isClosing={false}
                onCloseComplete={NOOP}
                scrollContainerRef={inertScrollRef}
                chosenRitualId={chosenRituals[god.id]}
                isActive={isVisuallyActive}
                highlightParticipantType={highlightParticipantType}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Left rail: every god as a full GodCard (with its own ritual panel, used as-is), in a plain
// natively-scrolling column — always visible, independent of which god is centered in the carousel.
function GodListLayout({ gods, scrollPos, onScrollPosChange, settledIndex, onSettledIndexChange, onCardClick, cardRefs, originRect, originGodId, chosenRituals, onChooseRitual, onUnchooseRitual, onRitualHoverChange, onBack, header, highlightParticipantType }: {
  gods: God[]
  scrollPos: number
  onScrollPosChange: (pos: number) => void
  settledIndex: number
  onSettledIndexChange: (index: number) => void
  onCardClick: (godId: string) => void
  cardRefs: React.RefObject<Record<string, HTMLDivElement | null>>
  originRect: DOMRect | null
  originGodId: string | null
  chosenRituals: Record<string, string>
  onChooseRitual: (godId: string, ritualId: string) => void
  onUnchooseRitual: (godId: string) => void
  onRitualHoverChange: (ritual: Ritual | null) => void
  onBack: () => void
  header: React.ReactNode
  highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null
}) {
  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <div
        style={{
          // Widened from 280px so the header subtitle wraps to 2 lines instead of 3
          // (232px of content width wraps it to 3; needs >=236px, this gives comfortable room).
          width: '300px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {header}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: SPACING.sm,
            padding: '12px 24px 24px',
          }}
        >
          {gods.map((god, index) => {
            const isSelected = index === settledIndex
            const chosenRitual = god.rituals.find(r => r.id === chosenRituals[god.id]) ?? null
            const isFirstInTier = index === 0 || gods[index - 1].angerLevel !== god.angerLevel
            return (
              <Fragment key={god.id}>
                {isFirstInTier && <ListAngerTierHeader level={god.angerLevel} isFirst={index === 0} />}
                <ListGodRow
                  god={god}
                  isSelected={isSelected}
                  chosenRitual={chosenRitual}
                  onClick={() => onCardClick(god.id)}
                  domRef={el => { cardRefs.current[god.id] = el }}
                />
              </Fragment>
            )
          })}
        </div>
      </div>
      <div style={{ flexShrink: 0, width: '1px', backgroundColor: COLORS.gray20 }} />
      <GodFreeCarousel
        gods={gods}
        scrollPos={scrollPos}
        onScrollPosChange={onScrollPosChange}
        onSettledIndexChange={onSettledIndexChange}
        originRect={originRect}
        originGodId={originGodId}
        chosenRituals={chosenRituals}
        onChooseRitual={onChooseRitual}
        onUnchooseRitual={onUnchooseRitual}
        onRitualHoverChange={onRitualHoverChange}
        onBack={onBack}
        highlightParticipantType={highlightParticipantType}
      />
    </div>
  )
}

// One row in the GODS rail. Mirrors GodCard's own hover model exactly: a local isHovered
// state combines with isSelected into a single `highlighted` flag that drives every
// color/border/opacity toggle below, so hovering a row reads the same as hovering/selecting
// a card in grid view.
function ListGodRow({ god, isSelected, chosenRitual, onClick, domRef }: {
  god: God
  isSelected: boolean
  chosenRitual: Ritual | null
  onClick: () => void
  domRef: (el: HTMLDivElement | null) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const highlighted = isSelected || isHovered
  // Border and icon always share this one value — same rule as RingedIcon's borderColor/icon
  // color pairing — so the dashed/solid card and the flame read as a single unit, not two
  // independently-colored pieces. Chosen state is a flat bright white, not the ritual's own
  // outcome color — that color already lives on the eye ring/outcome circle elsewhere. The
  // not-chosen highlighted border value (gray60) is GodCard's own ritual-panel hover value,
  // copied exactly.
  const fireColor = chosenRitual
    ? COLORS.white
    : highlighted ? COLORS.gray60 : COLORS.gray20
  return (
    <div
      ref={domRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${highlighted ? COLORS.gray30 : COLORS.gray15}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // Fill reflects isSelected only, not hover — hover changes the stroke alone.
        backgroundColor: isSelected ? COLORS.gray18 : 'transparent',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          boxShadow: `inset 0 0 0 ${EYE[god.angerLevel].weight}px ${EYE[god.angerLevel].color}`,
          opacity: highlighted ? 1 : 0.12,
          flexShrink: 0,
          transition: 'opacity 0.15s ease',
        }}
      />
      <span
        style={{
          fontFamily: FONTS.spectral,
          fontSize: '13px',
          fontWeight: 400,
          color: highlighted ? COLORS.white : COLORS.gray40,
          opacity: highlighted ? 1 : 0.4,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 0.15s ease, opacity 0.15s ease',
        }}
      >
        {god.name}
      </span>
      <span
        style={{
          display: 'flex',
          flexShrink: 0,
          marginLeft: 'auto',
          padding: '4px',
          borderRadius: '4px',
          border: `1px ${chosenRitual ? 'solid' : 'dashed'} ${fireColor}`,
          // GodCard's own ritual-panel hover fill (gray13) sits on cardBg (#151515) there, so
          // it reads as a clear lift. This card sits on the page background (and gray18 when
          // the row is selected) — gray13 is barely brighter than one and darker than the
          // other, so it doesn't visibly lift here. gray20 is the nearest token that's
          // actually lighter than both surroundings.
          backgroundColor: highlighted ? COLORS.gray20 : 'transparent',
        }}
      >
        <FireIcon size={12} color={fireColor} />
      </span>
    </div>
  )
}

function ViewModeToggle({ viewMode, onChange }: { viewMode: 'grid' | 'list'; onChange: (mode: 'grid' | 'list') => void }) {
  const option = (mode: 'grid' | 'list', icon: (color: string) => React.ReactNode) => (
    <button
      key={mode}
      aria-label={mode === 'grid' ? 'Grid view' : 'List view'}
      onClick={() => onChange(mode)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: viewMode === mode ? COLORS.gray20 : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      {icon(viewMode === mode ? COLORS.white : COLORS.gray40)}
    </button>
  )
  return (
    <div style={{ flexShrink: 0, display: 'flex', gap: '4px', border: `1px solid ${COLORS.gray20}`, borderRadius: '8px', padding: '2px' }}>
      {option('grid', c => <GridFour size={16} color={c} weight="regular" />)}
      {option('list', c => <ListBullets size={16} color={c} weight="regular" />)}
    </div>
  )
}

// Same title treatment as AngerTierHeader below (18px EYE-weight ring + label), sized for the
// list rail's own padding instead of the grid's 24px horizontal gutter.
function ListAngerTierHeader({ level, isFirst }: { level: AngerLevel; isFirst?: boolean }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: isFirst ? '0 0 8px' : '16px 0 8px' }}>
      <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${EYE[level].weight}px ${EYE[level].color}` }} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.gray80 }}>{TIER_LABELS[level]}</span>
    </div>
  )
}

// Section header above each non-empty anger tier's card grid — an 18px EYE-weight ring
// (never a smaller size, never solid-fill; matches the anger-label circle used everywhere else)
// plus the tier's label.
function AngerTierHeader({ level }: { level: AngerLevel }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 24px 0' }}>
      <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${EYE[level].weight}px ${EYE[level].color}` }} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.gray80 }}>{TIER_LABELS[level]}</span>
    </div>
  )
}

interface HomeScreenProps {
  prisoners: number
  volunteers: number
  children: number
  virgins: number
  temples?: number
  greatTemples?: number
  resourceTotals?: typeof RESOURCE_TOTALS
  aiPanelOpen?: boolean
  // Lets the AI toggle button (rendered outside this component, at the App level) know when
  // HomeActionBar is occupying the bottom-right corner, so it can move up out of the way
  // instead of overlapping it. See App.tsx/AiChat.tsx for the other side of this wiring.
  onActionBarVisibleChange?: (visible: boolean) => void
}

export function HomeScreen({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, aiPanelOpen = false, onActionBarVisibleChange }: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [listScrollPos, setListScrollPos] = useState(0)
  const [listSettledIndex, setListSettledIndex] = useState(0)
  const [chosenRituals, setChosenRituals] = useState<Record<string, string>>({})
  const [spentCost, setSpentCost] = useState<ResourceCost>(ZERO_COST)
  const [resultEntries, setResultEntries] = useState<Array<{ god: God; ritual: Ritual }> | null>(null)
  const [hoveredRitual, setHoveredRitual] = useState<Ritual | null>(null)
  const [hoveredResourceType, setHoveredResourceType] = useState<'prisoners' | 'volunteers' | 'children' | 'virgins' | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const [originGodId, setOriginGodId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Resources go down the moment a ritual is assigned (reserved), and stay down once authorized.
  const reservedCost = sumRitualCost(chosenRituals)
  const availablePrisoners = prisoners - spentCost.prisoners - reservedCost.prisoners
  const availableVolunteers = volunteers - spentCost.volunteers - reservedCost.volunteers
  const availableChildren = children - spentCost.children - reservedCost.children
  const availableVirgins = virgins - spentCost.virgins - reservedCost.virgins
  const availableTemples = temples - spentCost.temples - reservedCost.temples
  const availableGreatTemples = greatTemples - spentCost.greatTemples - reservedCost.greatTemples

  const actionBarVisible = viewMode === 'grid'
  // Update on every visibility change...
  useEffect(() => { onActionBarVisibleChange?.(actionBarVisible) }, [actionBarVisible])
  // ...and separately reset on unmount (switching away from the overview screen), since the
  // dependency-triggered effect above never gets a final run with actionBarVisible=false here.
  useEffect(() => () => onActionBarVisibleChange?.(false), [])

  const handleSelectGod = (godId: string) => {
    // originRect/originGodId drive HomeGodDetailPanel's FLIP grow-in animation (see the
    // useLayoutEffect keyed on `originRect` there) — only meant to play once, when a card is
    // first clicked from the grid. Picking a different row from the already-open list rail
    // reuses this same handler (GodListLayout's onCardClick), but cardRefs also holds the rail
    // rows' own (much smaller) rects; setting originRect there made the newly selected god's
    // panel FLIP-grow from that tiny row size on every pick — a spurious rescale on top of the
    // intended carousel scroll. Only set origin state on the actual grid->list transition.
    if (viewMode !== 'list') {
      const el = cardRefs.current[godId]
      setOriginRect(el ? el.getBoundingClientRect() : null)
      setOriginGodId(godId)
    }
    setListScrollPos(DISPLAY_GODS_BY_TIER.findIndex(g => g.id === godId))
    setViewMode('list')
  }

  const handleChooseRitual = (godId: string, ritualId: string) => {
    setChosenRituals(prev => ({ ...prev, [godId]: ritualId }))
  }

  const handleUnchooseRitual = (godId: string) => {
    setChosenRituals(prev => {
      const next = { ...prev }
      delete next[godId]
      return next
    })
  }

  const renderGrid = (gods: typeof DISPLAY_GODS) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
        gap: '24px',
        padding: '24px',
      }}
    >
      {gods.map(god => {
        const chosenRitualId = chosenRituals[god.id]
        const chosenRitual = chosenRitualId ? god.rituals.find(r => r.id === chosenRitualId) ?? null : null
        return (
          <GodCard
            key={god.id}
            god={god}
            isSelected={false}
            onClick={() => handleSelectGod(god.id)}
            chosenRitual={chosenRitual}
            domRef={el => { cardRefs.current[god.id] = el }}
            onHoverChange={hovered => setHoveredRitual(hovered ? chosenRitual : null)}
            highlightParticipantType={hoveredResourceType}
          />
        )
      })}
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative', backgroundColor: COLORS.black }}>
      <HomeResourceBar prisoners={availablePrisoners} volunteers={availableVolunteers} children={availableChildren} virgins={availableVirgins} temples={availableTemples} greatTemples={availableGreatTemples} resourceTotals={resourceTotals} hoveredRitual={hoveredRitual} onResourceHover={setHoveredResourceType} />
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          overflow: 'auto',
          marginRight: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {viewMode === 'grid' && (
          <>
            <div style={{ flexShrink: 0, position: 'relative', padding: '24px 24px 0', textAlign: 'left' }}>
              <div
                style={{
                  // Fixed (not absolute) so it escapes this column's overflow:auto scroll clipping
                  // and aligns with the true viewport edge, matching the floating AI button's own
                  // fixed right:24px offset — an absolute negative-right offset here gets clipped
                  // by the scrollable ancestor instead of reaching the actual screen edge.
                  position: 'fixed',
                  top: '163px',
                  right: '24px',
                  zIndex: 10,
                }}
              >
                <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
              </div>
              <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.regular, color: COLORS.gray80 }}>Choose rituals to appease the gods</div>
              <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.4)', marginTop: '4px', whiteSpace: 'nowrap' }}>Avoid punishment by performing appeasement rituals for your gods</div>
            </div>

            {DISPLAY_GOD_BUCKETS.map(({ level, gods }) => (
              <Fragment key={level}>
                <AngerTierHeader level={level} />
                {renderGrid(gods)}
              </Fragment>
            ))}
          </>
        )}
        {viewMode === 'list' && (
          <GodListLayout
            gods={DISPLAY_GODS_BY_TIER}
            scrollPos={listScrollPos}
            onScrollPosChange={setListScrollPos}
            settledIndex={listSettledIndex}
            onSettledIndexChange={setListSettledIndex}
            onCardClick={handleSelectGod}
            cardRefs={cardRefs}
            originRect={originRect}
            originGodId={originGodId}
            chosenRituals={chosenRituals}
            onChooseRitual={handleChooseRitual}
            onUnchooseRitual={handleUnchooseRitual}
            onRitualHoverChange={setHoveredRitual}
            onBack={() => setViewMode('grid')}
            highlightParticipantType={hoveredResourceType}
            header={
              <div style={{ flexShrink: 0, position: 'relative', padding: '24px 24px 0', textAlign: 'left' }}>
                {/* Fixed (not absolute), matching the grid view's toggle — escapes this 260px-wide
                    list rail to sit at the true viewport edge instead of the rail's own right edge. */}
                <div style={{ position: 'fixed', top: '163px', right: '24px', zIndex: 10 }}>
                  <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
                </div>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.regular, color: COLORS.gray80 }}>Choose rituals to appease the gods</div>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Avoid punishment by performing appeasement rituals for your gods</div>
              </div>
            }
          />
        )}
      </div>
      {actionBarVisible && (
        <HomeActionBar
          chosenCount={Object.keys(chosenRituals).length}
          cost={reservedCost}
          onPerform={() => {
            setSpentCost(prev => ({
              prisoners: prev.prisoners + reservedCost.prisoners,
              volunteers: prev.volunteers + reservedCost.volunteers,
              children: prev.children + reservedCost.children,
              virgins: prev.virgins + reservedCost.virgins,
              temples: prev.temples + reservedCost.temples,
              greatTemples: prev.greatTemples + reservedCost.greatTemples,
            }))
            setResultEntries(
              Object.entries(chosenRituals)
                .map(([godId, ritualId]) => {
                  const god = GODS.find(g => g.id === godId.replace(/-dup-\d+$/, ''))
                  const ritual = god?.rituals.find(r => r.id === ritualId)
                  return god && ritual ? { god, ritual } : null
                })
                .filter((entry): entry is { god: God; ritual: Ritual } => !!entry)
            )
            setChosenRituals({})
          }}
          aiPanelOpen={aiPanelOpen}
        />
      )}
      {resultEntries && (
        <RitualResultScreen
          entries={resultEntries}
          resources={{ prisoners: availablePrisoners, volunteers: availableVolunteers, children: availableChildren, virgins: availableVirgins }}
          onDismiss={() => setResultEntries(null)}
        />
      )}
    </div>
  )
}
