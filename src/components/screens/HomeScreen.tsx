import { useState, useRef, useLayoutEffect, useEffect, Fragment } from 'react'
import { COLORS, FONTS, FONT_SIZE, FONT_WEIGHT, EYE, RESOURCE_TOTALS } from '../../tokens'
import { GODS, type God, type Ritual, type AngerLevel } from '../../data/gods'
import { GodSvg } from '../gods/GodSvg'
import { GodCard, CARD_WIDTH, outcomeEye, getSvgRaw } from '../gods/GodCard'
import { RitualCard } from '../ritual/RitualCard'
import { RitualSacrificeOverlay } from '../ritual/RitualSacrificeOverlay'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { GridFour, ListBullets } from '@phosphor-icons/react'

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
const DISPLAY_GODS = Array.from({ length: DISPLAY_GOD_COUNT }, (_, i) => ({
  ...GODS[i % GODS.length],
  id: `${GODS[i % GODS.length].id}-dup-${i}`,
}))
// One bucket per non-empty anger tier, in ANGER_TIERS order — feeds the grid's section headers.
const DISPLAY_GOD_BUCKETS = ANGER_TIERS
  .map(level => ({ level, gods: DISPLAY_GODS.filter(g => g.angerLevel === level) }))
  .filter(bucket => bucket.gods.length > 0)

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
  return <div style={{ flexShrink: 0, width: '1px', alignSelf: 'stretch', backgroundColor: fullBleed ? COLORS.black : COLORS.gray20, margin: fullBleed ? '-8px 0' : 0 }} />
}

function HomeResourceItem({ icon, label, count, total, cost, ritualActive, showChange }: { icon: (color: string) => React.ReactNode; label: string; count: number; total: number; cost?: number; ritualActive?: boolean; showChange?: boolean }) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = ritualActive ? (affected ? COLORS.gray95 : 'rgba(255,255,255,0.25)') : COLORS.gray95
  return (
    <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: '24px', transition: 'opacity 0.2s ease' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon(labelColor)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            {showChange && cost ? (
              <>
                <span style={{ fontSize: FONT_SIZE.xl, color: 'rgba(255,255,255,0.35)', opacity: 0.7, transition: 'color 0.2s ease' }}>{count}</span>
                <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: 0.7, transition: 'color 0.2s ease' }}> ({count - cost})</span>
              </>
            ) : (
              <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: 0.7, transition: 'color 0.2s ease' }}>{count}</span>
            )}
            <span style={{ color: valueColor, opacity: 0.4, transition: 'color 0.2s ease' }}> / {total}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeSiteItem({ icon, label, available, total, cost, ritualActive, showChange }: { icon: (color: string) => React.ReactNode; label: string; available: number; total: number; cost?: number; ritualActive?: boolean; showChange?: boolean }) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : COLORS.gray60
  const valueColor = ritualActive ? (affected ? COLORS.gray95 : 'rgba(255,255,255,0.25)') : COLORS.gray95
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '16px', transition: 'opacity 0.2s ease' }}>
      <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', border: `1px solid ${COLORS.gray30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon(labelColor)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.regular, color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.lg, whiteSpace: 'nowrap' }}>
            {showChange && cost ? (
              <>
                <span style={{ fontSize: FONT_SIZE.xl, color: 'rgba(255,255,255,0.35)', opacity: 0.7, transition: 'color 0.2s ease' }}>{available}</span>
                <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: 0.7, transition: 'color 0.2s ease' }}> ({available - cost})</span>
              </>
            ) : (
              <span style={{ fontSize: FONT_SIZE.xl, color: valueColor, opacity: 0.7, transition: 'color 0.2s ease' }}>{available}</span>
            )}
            <span style={{ color: valueColor, opacity: 0.4, transition: 'color 0.2s ease' }}> / {total}</span>
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

function HomeResourceBar({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, hoveredRitual }: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number; resourceTotals?: typeof RESOURCE_TOTALS; hoveredRitual?: Ritual | null }) {
  const ritualActive = !!hoveredRitual
  const showChange = !!hoveredRitual
  return (
    <div style={{ flexShrink: 0, backgroundColor: COLORS.black, borderBottom: `1px solid ${COLORS.gray20}`, boxShadow: '0 4px 8px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '28px 48px 28px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Resources</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px', width: '730px', borderRadius: '10px', backgroundColor: COLORS.gray15, padding: '8px 24px' }}>
          <HomeResourceItem icon={c => <PrisonerIcon size={28} color={c} />} label="Prisoners" count={prisoners} total={resourceTotals.prisoners} cost={hoveredRitual?.participants.prisoners} ritualActive={ritualActive} showChange={showChange} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VolunteerIcon size={28} color={c} />} label="Volunteers" count={volunteers} total={resourceTotals.volunteers} cost={hoveredRitual?.participants.volunteers} ritualActive={ritualActive} showChange={showChange} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <ChildrenIcon size={28} color={c} />} label="Children" count={children} total={resourceTotals.children} cost={hoveredRitual?.participants.children} ritualActive={ritualActive} showChange={showChange} />
          <ResourceDivider fullBleed />
          <HomeResourceItem icon={c => <VirginIcon size={28} color={c} />} label="Virgins" count={virgins} total={resourceTotals.virgins} cost={hoveredRitual?.participants.virgins} ritualActive={ritualActive} showChange={showChange} />
        </div>
      </div>
      <div style={{ flexShrink: 0, width: '1px', height: '80px', backgroundColor: COLORS.gray20, margin: '0 16px 0 120px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Ritual Sites</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <HomeSiteItem icon={c => <PyramidIcon size={34} color={c} />} label="Temple" available={temples} total={resourceTotals.temples} cost={hoveredRitual?.sacredSite.name === 'Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} showChange={showChange} />
          <ResourceDivider />
          <HomeSiteItem icon={c => <PyramidIcon size={34} color={c} />} label="Grand Temple" available={greatTemples} total={resourceTotals.greatTemples} cost={hoveredRitual?.sacredSite.name === 'Grand Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} showChange={showChange} />
        </div>
      </div>
    </div>
  )
}

function ChooseRitualButton({ onChoose, isHovered }: { onChoose: () => void; isHovered: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onChoose}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onChoose() }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: 'fit-content',
        margin: '0 auto',
        padding: '8px 16px',
        border: `1px solid ${isHovered ? '#ffffff' : 'rgba(255,255,255,0.25)'}`,
        borderRadius: '6px',
        backgroundColor: isHovered ? '#ffffff' : 'transparent',
        color: isHovered ? '#000000' : '#ffffff',
        fontFamily: FONTS.spectral,
        fontWeight: 400,
        fontSize: '14px',
        letterSpacing: '0.5px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      <span style={{ display: 'flex', transform: 'translateY(-1px)' }}>
        <FireIcon size={16} color={isHovered ? '#000000' : '#ffffff'} />
      </span>
      <span>Select Ritual</span>
    </div>
  )
}

function RitualCardWithChoose({ ritual, godName, isSelected, onChoose, onHoverChange }: { ritual: Ritual; godName: string; isSelected: boolean; onChoose: () => void; onHoverChange?: (isHovered: boolean) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <RitualCard
      ritual={ritual}
      godName={godName}
      isSelected={isSelected}
      onClick={onChoose}
      onHoverChange={hovered => { setIsHovered(hovered); onHoverChange?.(hovered) }}
      footer={<ChooseRitualButton onChoose={onChoose} isHovered={isHovered} />}
    />
  )
}

const FLIP_DURATION = 900
const DRAWER_CLOSE_DURATION = 260
const SCROLL_TOP_GAP = 24

function HomeGodDetailPanel({ god, onBack, onChoose, onRitualHoverChange, originRect, isClosing, onCloseComplete, scrollContainerRef, chosenRitualId, isActive = true }: { god: God; onBack: () => void; onChoose: (ritualId: string) => void; onRitualHoverChange: (ritual: Ritual | null) => void; originRect: DOMRect | null; isClosing: boolean; onCloseComplete: () => void; scrollContainerRef: React.RefObject<HTMLDivElement | null>; chosenRitualId?: string | null; isActive?: boolean }) {
  // Widened to match outcomeEye()'s return type — EYE itself is `as const` (a literal-typed
  // union per level), which would otherwise stop `to`/`from` below from ever holding an
  // outcomeEye() result once a ritual is hovered.
  const baseEye: { color: string; weight: number } = EYE[god.angerLevel as AngerLevel]
  const [eyeAnim, setEyeAnim] = useState<{ from: typeof baseEye; to: typeof baseEye; key: number; delay: number } | null>(null)
  const currentEyeRef = useRef(baseEye)
  const panelRef = useRef<HTMLDivElement>(null)
  // Caches the one-time scroll delta below — unlike the transform reset, scrolling the container
  // is a side effect that persists across StrictMode's double-invoke, so it must run at most once.
  const scrollAdjustRef = useRef<number | null>(null)

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

  const handleRitualHover = (ritual: Ritual, hovered: boolean) => {
    const target = hovered ? outcomeEye(ritual.outcomeColor) : baseEye
    const from = currentEyeRef.current
    currentEyeRef.current = target
    setEyeAnim(prev => ({ from, to: target, key: (prev?.key ?? 0) + 1, delay: hovered ? 0 : 0.3 }))
    onRitualHoverChange(hovered ? ritual : null)
  }

  return (
    <div ref={panelRef} style={{ flexShrink: 0, margin: '24px 24px 0', padding: '24px', border: `1px solid ${isActive ? COLORS.gray30 : COLORS.gray15}`, borderRadius: '10px', transition: 'border-color 0.15s ease' }}>
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flexShrink: 0, width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={onBack}
            style={{
              flexShrink: 0,
              width: '100%',
              cursor: 'pointer',
              textAlign: 'center',
              ...(drawerClosing
                ? { opacity: 0, transform: 'translateY(-10px)', transition: `opacity ${DRAWER_CLOSE_DURATION}ms ease-in, transform ${DRAWER_CLOSE_DURATION}ms ease-in` }
                : { animation: `homeDetailHeaderEnter 280ms cubic-bezier(0.23, 1, 0.32, 1) ${FLIP_DURATION - 80}ms both` }),
            }}
          >
            <span style={{ fontFamily: FONTS.cinzel, fontSize: '24px', fontWeight: 400, color: isActive ? '#ffffff' : COLORS.gray15, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.15s ease' }}>{god.name}</span>
            <p style={{ margin: '4px 0 0', fontFamily: FONTS.spectral, fontSize: '16px', color: isActive ? '#909090' : COLORS.gray15, transition: 'color 0.15s ease' }}>{god.subtitle}</p>
          </div>
          <div style={{ flexShrink: 0, width: '100%', height: '420px', borderRadius: '10px', overflow: 'hidden' }}>
            <GodSvg
              svgRaw={getSvgRaw(god.id)}
              angerLevel={god.angerLevel}
              bodyColor={isActive ? '#e0e0e0' : COLORS.gray15}
              instanceId={`detail-${god.id}`}
              eyeAnimation={eyeAnim ? { fromColor: eyeAnim.from.color, fromWeight: eyeAnim.from.weight, toColor: eyeAnim.to.color, toWeight: eyeAnim.to.weight, delay: eyeAnim.delay, duration: 0.5, id: `eye-${eyeAnim.key}` } : undefined}
            />
          </div>
        </div>
        <div style={{ flexShrink: 0, width: '1px', margin: '-24px 0', backgroundColor: '#333333' }} />
        {/* Ritual selection "drawer" — waits for the move+grow to finish, then wipes open left-to-right.
            On close it reverses first (wipes shut) before the shell shrinks. */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            ...(drawerClosing
              ? { opacity: 0, clipPath: 'inset(0 100% 0 0)', transition: `opacity ${DRAWER_CLOSE_DURATION}ms ease-in, clip-path ${DRAWER_CLOSE_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)` }
              : { animation: `homeDetailDrawerReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) ${FLIP_DURATION}ms both` }),
          }}
        >
          {god.rituals.slice(0, 3).map(ritual => {
            return (
              <div key={ritual.id} style={{ width: '250px', flexShrink: 0 }}>
                <RitualCardWithChoose
                  ritual={ritual}
                  godName={god.name}
                  isSelected={ritual.id === chosenRitualId}
                  onChoose={() => onChoose(ritual.id)}
                  onHoverChange={hovered => handleRitualHover(ritual, hovered)}
                />
              </div>
            )
          })}
        </div>
      </div>
      <style>{`
        @keyframes homeDetailHeaderEnter {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes homeDetailDrawerReveal {
          from { opacity: 0; clip-path: inset(0 100% 0 0); }
          to { opacity: 1; clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </div>
  )
}

const ESTIMATED_PANEL_HEIGHT = 650

const NOOP = () => {}

const FREE_CAROUSEL_GAP = 0
const FREE_CAROUSEL_WINDOW_RADIUS = 2
const FREE_SCROLL_SENSITIVITY = 300 // divides wheel deltaY into virtual-index units; tuned so a strong fling covers several gods, not just one
const FREE_SETTLE_DELAY = 180
const FREE_SNAP_DURATION = 380

// Positions panels using measured per-panel heights and a continuous (fractional) `scrollPos`
// virtual index: while wheeling, panels track the gesture 1:1 with transitions off; once wheel
// input stops for FREE_SETTLE_DELAY, it snaps to the nearest whole index with a brief transition.
// This is what gives the Figma-Slides-like "fly past several, then settle" feel.
function GodFreeCarousel({ gods, scrollPos, onScrollPosChange, onSettledIndexChange, originRect, originGodId, chosenRituals, onChooseRitual, onRitualHoverChange }: {
  gods: God[]
  scrollPos: number
  onScrollPosChange: (pos: number) => void
  onSettledIndexChange: (index: number) => void
  originRect: DOMRect | null
  originGodId: string | null
  chosenRituals: Record<string, string>
  onChooseRitual: (godId: string, ritualId: string) => void
  onRitualHoverChange: (ritual: Ritual | null) => void
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const inertScrollRef = useRef<HTMLDivElement>(null)
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({})
  const roRef = useRef<ResizeObserver | null>(null)
  const observedRef = useRef<Map<string, HTMLElement>>(new Map())
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSnapping, setIsSnapping] = useState(false)

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

  const windowStart = Math.max(0, Math.floor(scrollPos) - FREE_CAROUSEL_WINDOW_RADIUS)
  const windowEnd = Math.min(gods.length - 1, Math.ceil(scrollPos) + FREE_CAROUSEL_WINDOW_RADIUS)
  const windowIndices: number[] = []
  for (let i = windowStart; i <= windowEnd; i++) windowIndices.push(i)

  const anchorTop = cumulativeTop(scrollPos)
  // Anchored near the top of the carousel viewport (close to the resource bar) rather than
  // vertically centered — HomeGodDetailPanel's own 24px top margin already provides the breathing
  // room, so the active panel's top edge lands just below the header area.
  const baseOffset = 0

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setIsSnapping(false)
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
    const next = Math.max(0, Math.min(gods.length - 1, scrollPos + e.deltaY / FREE_SCROLL_SENSITIVITY))
    onScrollPosChange(next)
    settleTimeoutRef.current = setTimeout(() => {
      setIsSnapping(true)
      onScrollPosChange(Math.round(next))
    }, FREE_SETTLE_DELAY)
  }

  return (
    <div ref={viewportRef} onWheel={handleWheel} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {windowIndices.map(index => {
        const god = gods[index]
        const isActive = index === roundedIndex
        const top = baseOffset + (cumulativeTop(index) - anchorTop)
        return (
          <div
            key={god.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${top}px)`,
              pointerEvents: isActive ? 'auto' : 'none',
              transition: isSnapping ? `transform ${FREE_SNAP_DURATION}ms cubic-bezier(0.23, 1, 0.32, 1)` : 'none',
            }}
          >
            <div ref={el => registerPanelEl(god.id, el)} style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
              <HomeGodDetailPanel
                god={god}
                onBack={NOOP}
                onChoose={ritualId => onChooseRitual(god.id, ritualId)}
                onRitualHoverChange={onRitualHoverChange}
                originRect={god.id === originGodId ? originRect : null}
                isClosing={false}
                onCloseComplete={NOOP}
                scrollContainerRef={inertScrollRef}
                chosenRitualId={chosenRituals[god.id]}
                isActive={isActive}
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
function GodListLayout({ gods, scrollPos, onScrollPosChange, settledIndex, onSettledIndexChange, onCardClick, cardRefs, originRect, originGodId, chosenRituals, onChooseRitual, onRitualHoverChange, header }: {
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
  onRitualHoverChange: (ritual: Ritual | null) => void
  header: React.ReactNode
}) {
  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      <div
        style={{
          width: '260px',
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
            gap: '4px',
            padding: '12px 24px 24px',
          }}
        >
          {gods.map((god, index) => {
            const isSelected = index === settledIndex
            const hasChosenRitual = !!chosenRituals[god.id]
            return (
              <div
                key={god.id}
                ref={el => { cardRefs.current[god.id] = el }}
                onClick={() => onCardClick(god.id)}
                style={{
                  position: 'relative',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: isSelected ? COLORS.gray18 : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    boxShadow: `inset 0 0 0 ${EYE[god.angerLevel].weight}px ${EYE[god.angerLevel].color}`,
                    opacity: isSelected ? 1 : 0.12,
                    flexShrink: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: FONTS.cinzel,
                    fontSize: '13px',
                    fontWeight: 400,
                    color: isSelected ? COLORS.white : COLORS.gray40,
                    opacity: isSelected ? 1 : 0.4,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'color 0.15s ease, opacity 0.15s ease',
                  }}
                >
                  {god.name}
                </span>
                {hasChosenRitual && (
                  <span style={{ display: 'flex', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.15s ease' }}>
                    <FireIcon size={16} color={isSelected ? COLORS.white : COLORS.gray40} />
                  </span>
                )}
              </div>
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
        onRitualHoverChange={onRitualHoverChange}
      />
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

// Section header above each non-empty anger tier's card grid — an 18px EYE-weight ring
// (never a smaller size, never solid-fill; matches the anger-label circle used everywhere else)
// plus the tier's label.
function AngerTierHeader({ level }: { level: AngerLevel }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 24px 0' }}>
      <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${EYE[level].weight}px ${EYE[level].color}` }} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{TIER_LABELS[level]}</span>
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
}

export function HomeScreen({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, aiPanelOpen = false }: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [listScrollPos, setListScrollPos] = useState(0)
  const [listSettledIndex, setListSettledIndex] = useState(0)
  const [chosenRituals, setChosenRituals] = useState<Record<string, string>>({})
  const [spentCost, setSpentCost] = useState<ResourceCost>(ZERO_COST)
  const [sacrificeCost, setSacrificeCost] = useState<ResourceCost | null>(null)
  const [hoveredRitual, setHoveredRitual] = useState<Ritual | null>(null)
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

  const handleSelectGod = (godId: string) => {
    const el = cardRefs.current[godId]
    setOriginRect(el ? el.getBoundingClientRect() : null)
    setOriginGodId(godId)
    setListScrollPos(DISPLAY_GODS.findIndex(g => g.id === godId))
    setViewMode('list')
  }

  const handleChooseRitual = (godId: string, ritualId: string) => {
    setChosenRituals(prev => ({ ...prev, [godId]: ritualId }))
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
          />
        )
      })}
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative', backgroundColor: COLORS.black }}>
      <HomeResourceBar prisoners={availablePrisoners} volunteers={availableVolunteers} children={availableChildren} virgins={availableVirgins} temples={availableTemples} greatTemples={availableGreatTemples} resourceTotals={resourceTotals} hoveredRitual={hoveredRitual} />
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
            <div style={{ flexShrink: 0, padding: '24px 24px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.regular, color: COLORS.white }}>Choose rituals to appease the gods</div>
                <div style={{ transform: 'translateY(-2px)' }}>
                  <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
                </div>
              </div>
              <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.4)', marginTop: '4px', whiteSpace: 'nowrap' }}>Avoid punishment by performing appeasement rituals for the angry gods</div>
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
            gods={DISPLAY_GODS}
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
            onRitualHoverChange={setHoveredRitual}
            header={
              <div style={{ flexShrink: 0, padding: '24px 24px 0', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 500, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>Gods</div>
                  <div style={{ transform: 'translateY(-2px)' }}>
                    <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
                  </div>
                </div>
                <div style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.4)', marginTop: '4px', whiteSpace: 'nowrap' }}>Select rituals to appease the gods</div>
              </div>
            }
          />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          bottom: 0,
          height: '96px',
          background: `linear-gradient(to bottom, transparent, ${COLORS.black})`,
          pointerEvents: 'none',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          bottom: '56px',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => setSacrificeCost(reservedCost)}
            disabled={Object.keys(chosenRituals).length === 0}
            style={{
              padding: '0 56px',
              height: '44px',
              border: Object.keys(chosenRituals).length > 0 ? '1px solid #ffffff' : 'none',
              borderRadius: '8px',
              backgroundColor: Object.keys(chosenRituals).length > 0 ? '#ffffff' : '#2a2a2a',
              color: Object.keys(chosenRituals).length > 0 ? '#000000' : '#6c6c6c',
              boxShadow: Object.keys(chosenRituals).length > 0 ? '0 0 32px 10px rgba(0,0,0,1)' : 'none',
              fontFamily: FONTS.spectral,
              fontWeight: 400,
              fontSize: '16px',
              textTransform: 'uppercase',
              cursor: Object.keys(chosenRituals).length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            Authorize All Selected Rituals ({Object.keys(chosenRituals).length})
          </button>
        </div>
      </div>
      {sacrificeCost && (
        <RitualSacrificeOverlay
          counts={sacrificeCost}
          chosenRituals={chosenRituals}
          onComplete={() => {
            setSpentCost(prev => ({
              prisoners: prev.prisoners + sacrificeCost.prisoners,
              volunteers: prev.volunteers + sacrificeCost.volunteers,
              children: prev.children + sacrificeCost.children,
              virgins: prev.virgins + sacrificeCost.virgins,
              temples: prev.temples + sacrificeCost.temples,
              greatTemples: prev.greatTemples + sacrificeCost.greatTemples,
            }))
            setChosenRituals({})
            setSacrificeCost(null)
          }}
        />
      )}
    </div>
  )
}
