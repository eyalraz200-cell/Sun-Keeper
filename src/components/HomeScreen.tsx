import { useState, useRef, useLayoutEffect } from 'react'
import { COLORS, FONTS, RESOURCE_TOTALS } from '../tokens'
import { GODS, type God, type Ritual, type AngerLevel } from '../data/gods'
import { GodSvg } from './GodSvg'
import { GodCard, CARD_WIDTH, outcomeEye, getSvgRaw } from './GodCard'
import { RitualCard } from './RitualCard'
import { RitualSacrificeOverlay } from './RitualSacrificeOverlay'
import { FireIcon } from './FireIcon'
import { PrisonerIcon } from './PrisonerIcon'
import { ChildrenIcon } from './ChildrenIcon'
import { VirginIcon } from './VirginIcon'
import { VolunteerIcon } from './VolunteerIcon'

const ANGER_EYE: Record<AngerLevel, { color: string; weight: number }> = {
  high: { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low: { color: '#D7C94E', weight: 3 },
  none: { color: '#6C6C6C', weight: 2 },
}

const AI_TOGGLE_RESERVE = '96px' // keeps the floating AI toggle button (54px circle, 12px from right edge) off the card grid
const ANGER_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }

const DISPLAY_GOD_COUNT = 24
const DISPLAY_GODS = Array.from({ length: DISPLAY_GOD_COUNT }, (_, i) => ({
  ...GODS[i % GODS.length],
  id: `${GODS[i % GODS.length].id}-dup-${i}`,
})).sort((a, b) => ANGER_ORDER[a.angerLevel] - ANGER_ORDER[b.angerLevel])

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

function HomeResourceItem({ icon, label, count, total, cost, ritualActive, showChange }: { icon: (color: string) => React.ReactNode; label: string; count: number; total: number; cost?: number; ritualActive?: boolean; showChange?: boolean }) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : '#acacac'
  const valueColor = ritualActive ? (affected ? '#ffffff' : 'rgba(255,255,255,0.25)') : '#ffffff'
  return (
    <div style={{ flexShrink: 0, width: '170px', display: 'flex', alignItems: 'center', gap: '19px', transition: 'opacity 0.2s ease' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon(labelColor)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '16px', color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: FONTS.spectral, fontSize: '16px', whiteSpace: 'nowrap' }}>
            {showChange && cost ? (
              <>
                <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s ease' }}>{count}</span>
                <span style={{ fontSize: '20px', color: valueColor, transition: 'color 0.2s ease' }}> ({count - cost})</span>
              </>
            ) : (
              <span style={{ fontSize: '20px', color: valueColor, transition: 'color 0.2s ease' }}>{count}</span>
            )}
            <span style={{ color: valueColor, opacity: 0.4, transition: 'color 0.2s ease' }}> / {total}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HomeSiteItem({ label, available, total, cost, ritualActive, showChange }: { label: string; available: number; total: number; cost?: number; ritualActive?: boolean; showChange?: boolean }) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive ? (affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)') : '#acacac'
  const valueColor = ritualActive ? (affected ? '#ffffff' : 'rgba(255,255,255,0.25)') : '#ffffff'
  return (
    <div style={{ flexShrink: 0, width: '180px', display: 'flex', flexDirection: 'column', gap: '2px', transition: 'opacity 0.2s ease' }}>
      <span style={{ fontFamily: FONTS.spectral, fontSize: '16px', color: labelColor, transition: 'color 0.2s ease' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '16px', whiteSpace: 'nowrap' }}>
          {showChange && cost ? (
            <>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s ease' }}>{available}</span>
              <span style={{ fontSize: '20px', color: valueColor, transition: 'color 0.2s ease' }}> ({available - cost})</span>
            </>
          ) : (
            <span style={{ fontSize: '20px', color: valueColor, transition: 'color 0.2s ease' }}>{available}</span>
          )}
          <span style={{ color: valueColor, opacity: 0.4, transition: 'color 0.2s ease' }}> / {total}</span>
        </span>
      </div>
    </div>
  )
}

function HomeBarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 400, color: 'rgba(255,255,255,0.18)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>{children}</span>
  )
}

function HomeResourceBar({ prisoners, volunteers, children, virgins, temples = RESOURCE_TOTALS.temples, greatTemples = RESOURCE_TOTALS.greatTemples, resourceTotals = RESOURCE_TOTALS, hoveredRitual }: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; greatTemples?: number; resourceTotals?: typeof RESOURCE_TOTALS; hoveredRitual?: Ritual | null }) {
  const ritualActive = !!hoveredRitual
  const showChange = !!hoveredRitual
  return (
    <div style={{ flexShrink: 0, height: '104px', backgroundColor: COLORS.bgBase, borderBottom: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 48px 0 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Resources</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '96px' }}>
          <HomeResourceItem icon={c => <PrisonerIcon size={28} color={c} />} label="Prisoners" count={prisoners} total={resourceTotals.prisoners} cost={hoveredRitual?.participants.prisoners} ritualActive={ritualActive} showChange={showChange} />
          <HomeResourceItem icon={c => <ChildrenIcon size={28} color={c} />} label="Children" count={children} total={resourceTotals.children} cost={hoveredRitual?.participants.children} ritualActive={ritualActive} showChange={showChange} />
          <HomeResourceItem icon={c => <VirginIcon size={28} color={c} />} label="Virgins" count={virgins} total={resourceTotals.virgins} cost={hoveredRitual?.participants.virgins} ritualActive={ritualActive} showChange={showChange} />
          <HomeResourceItem icon={c => <VolunteerIcon size={28} color={c} />} label="Volunteers" count={volunteers} total={resourceTotals.volunteers} cost={hoveredRitual?.participants.volunteers} ritualActive={ritualActive} showChange={showChange} />
        </div>
      </div>
      <div style={{ flexShrink: 0, width: '1px', height: '80px', backgroundColor: '#333333', margin: '0 16px 0 120px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HomeBarSectionTitle>Available Ritual Sites</HomeBarSectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '96px' }}>
          <HomeSiteItem label="Temple" available={temples} total={resourceTotals.temples} cost={hoveredRitual?.sacredSite.name === 'Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} showChange={showChange} />
          <HomeSiteItem label="Grand Temple" available={greatTemples} total={resourceTotals.greatTemples} cost={hoveredRitual?.sacredSite.name === 'Grand Temple' ? hoveredRitual.sacredSite.count : 0} ritualActive={ritualActive} showChange={showChange} />
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
      <span>Choose Ritual</span>
    </div>
  )
}

function RitualCardWithChoose({ ritual, godName, onChoose, onHoverChange }: { ritual: Ritual; godName: string; onChoose: () => void; onHoverChange?: (isHovered: boolean) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <RitualCard
      ritual={ritual}
      godName={godName}
      isSelected={false}
      onClick={onChoose}
      onHoverChange={hovered => { setIsHovered(hovered); onHoverChange?.(hovered) }}
      footer={<ChooseRitualButton onChoose={onChoose} isHovered={isHovered} />}
    />
  )
}

const FLIP_DURATION = 900
const DRAWER_CLOSE_DURATION = 260
const SCROLL_TOP_GAP = 24

function HomeGodDetailPanel({ god, onBack, onChoose, onRitualHoverChange, originRect, isClosing, onCloseComplete, scrollContainerRef }: { god: God; onBack: () => void; onChoose: (ritualId: string) => void; onRitualHoverChange: (ritual: Ritual | null) => void; originRect: DOMRect | null; isClosing: boolean; onCloseComplete: () => void; scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const baseEye = ANGER_EYE[god.angerLevel as AngerLevel]
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
    <div ref={panelRef} style={{ flexShrink: 0, margin: '24px 24px 0', padding: '24px', border: '1px solid #333333', borderRadius: '10px' }}>
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
            <span style={{ fontFamily: FONTS.cinzel, fontSize: '24px', fontWeight: 400, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>{god.name}</span>
            <p style={{ margin: '4px 0 0', fontFamily: FONTS.spectral, fontSize: '16px', color: '#909090' }}>{god.subtitle}</p>
          </div>
          <div style={{ flexShrink: 0, width: '100%', height: '420px', borderRadius: '10px', overflow: 'hidden' }}>
            <GodSvg
              svgRaw={getSvgRaw(god.id)}
              angerLevel={god.angerLevel}
              bodyColor="#e0e0e0"
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
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const [chosenRituals, setChosenRituals] = useState<Record<string, string>>({})
  const [spentCost, setSpentCost] = useState<ResourceCost>(ZERO_COST)
  const [sacrificeCost, setSacrificeCost] = useState<ResourceCost | null>(null)
  const [hoveredRitual, setHoveredRitual] = useState<Ritual | null>(null)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pendingChoiceRef = useRef<{ godId: string; ritualId: string } | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedGod = DISPLAY_GODS.find(god => god.id === selectedGodId) ?? null

  // Resources go down the moment a ritual is assigned (reserved), and stay down once authorized.
  const reservedCost = sumRitualCost(chosenRituals)
  const availablePrisoners = prisoners - spentCost.prisoners - reservedCost.prisoners
  const availableVolunteers = volunteers - spentCost.volunteers - reservedCost.volunteers
  const availableChildren = children - spentCost.children - reservedCost.children
  const availableVirgins = virgins - spentCost.virgins - reservedCost.virgins
  const availableTemples = temples - spentCost.temples - reservedCost.temples
  const availableGreatTemples = greatTemples - spentCost.greatTemples - reservedCost.greatTemples

  const handleCardClick = (godId: string) => {
    const el = cardRefs.current[godId]
    setOriginRect(el ? el.getBoundingClientRect() : null)
    setSelectedGodId(prev => (prev === godId ? null : godId))
  }

  const handleChooseRitual = (godId: string, ritualId: string) => {
    pendingChoiceRef.current = { godId, ritualId }
    setIsClosing(true)
  }

  const handleCloseComplete = () => {
    const pending = pendingChoiceRef.current
    if (pending) {
      setChosenRituals(prev => ({ ...prev, [pending.godId]: pending.ritualId }))
      pendingChoiceRef.current = null
    }
    setSelectedGodId(null)
    setIsClosing(false)
  }

  const ANGER_LEVEL_LABEL: Record<AngerLevel, string> = { high: 'Furious', medium: 'Offended', low: 'Uneasy', none: 'At Peace' }
  const godGroups = (['high', 'medium', 'low', 'none'] as const)
    .map(level => ({ level, gods: DISPLAY_GODS.filter(god => god.angerLevel === level) }))
    .filter(group => group.gods.length > 0)

  const renderGrid = (gods: typeof DISPLAY_GODS) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
        justifyContent: 'space-between',
        gap: '24px',
        padding: '24px',
        opacity: selectedGod ? 0.25 : 1,
        transition: 'opacity 0.2s ease',
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
            onClick={() => handleCardClick(god.id)}
            chosenRitual={chosenRitual}
            domRef={el => { cardRefs.current[god.id] = el }}
          />
        )
      })}
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', backgroundColor: COLORS.bgBase }}>
      <HomeResourceBar prisoners={availablePrisoners} volunteers={availableVolunteers} children={availableChildren} virgins={availableVirgins} temples={availableTemples} greatTemples={availableGreatTemples} resourceTotals={resourceTotals} hoveredRitual={hoveredRitual} />
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto',
          marginRight: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!selectedGod && (
          <div style={{ flexShrink: 0, padding: '24px 24px 0', textAlign: 'left' }}>
            <div style={{ fontFamily: FONTS.cinzel, fontSize: '20px', fontWeight: 500, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>Gods</div>
            <div style={{ fontFamily: FONTS.spectral, fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>sorted by anger level</div>
          </div>
        )}

        {godGroups.map(group => {
          const indexInGroup = selectedGod && selectedGod.angerLevel === group.level
            ? group.gods.findIndex(god => god.id === selectedGodId)
            : -1
          const beforeGods = indexInGroup === -1 ? group.gods : group.gods.slice(0, indexInGroup)
          const afterGods = indexInGroup === -1 ? [] : group.gods.slice(indexInGroup + 1)

          return (
            <div key={group.level}>
              {!selectedGod && (
                <div style={{ flexShrink: 0, padding: '8px 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', boxShadow: `inset 0 0 0 ${ANGER_EYE[group.level].weight}px ${ANGER_EYE[group.level].color}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: '#ffffff' }}>
                    {ANGER_LEVEL_LABEL[group.level]}
                  </span>
                </div>
              )}

              {beforeGods.length > 0 && renderGrid(beforeGods)}

              {indexInGroup !== -1 && selectedGod && (
                <HomeGodDetailPanel
                  key={selectedGod.id}
                  god={selectedGod}
                  onBack={() => setSelectedGodId(null)}
                  onChoose={ritualId => handleChooseRitual(selectedGod.id, ritualId)}
                  onRitualHoverChange={setHoveredRitual}
                  originRect={originRect}
                  isClosing={isClosing}
                  onCloseComplete={handleCloseComplete}
                  scrollContainerRef={scrollContainerRef}
                />
              )}

              {afterGods.length > 0 && renderGrid(afterGods)}
            </div>
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: aiPanelOpen ? '331px' : AI_TOGGLE_RESERVE,
          bottom: 0,
          height: '96px',
          background: `linear-gradient(to bottom, transparent, ${COLORS.bgBase})`,
          pointerEvents: 'none',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      {!selectedGod && (
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
      )}
      {sacrificeCost && (
        <RitualSacrificeOverlay
          counts={sacrificeCost}
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
