import { useRef, useState, useEffect } from 'react'
import { ArrowCircleDown } from '@phosphor-icons/react'
import type { God } from '../data/gods'
import { GodCard } from './GodCard'
import { COLORS, FONTS, LAYOUT } from '../tokens'

interface GodListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
  activeRituals?: Record<string, string>
  isExpanded?: boolean
  onToggleExpanded?: () => void
  onCloseExpanded?: () => void
  wrathfulGodId?: string | null
}

export function ActiveRitualSummaryCard({ count, isHovered }: { count: number; isHovered: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        padding: '10px 12px',
        backgroundColor: COLORS.bgBase,
        border: isHovered ? `1px solid #ffffff` : `1px solid #333333`,
        borderRadius: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
      }}
    >
      <span style={{ fontFamily: FONTS.cinzel, fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff' }}>
        {count}
      </span>
      <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', fontWeight: 300, letterSpacing: '0.5px', color: '#ffffff' }}>
        Active Ritual{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

const STICKY_TOP = 24
const FADE_RANGE = 80
const GRID_GAP = 8
const GRID_PADDING = 12
const GRID_COLS = 5
const GRID_CARD_WIDTH = LAYOUT.sidebarWidth - 24
const OVERLAY_WIDTH = GRID_PADDING * 2 + GRID_COLS * GRID_CARD_WIDTH + (GRID_COLS - 1) * GRID_GAP

export function GodList({ gods, selectedGodId, onSelect, activeRituals = {}, isExpanded = false, onToggleExpanded, onCloseExpanded, wrathfulGodId = null }: GodListProps) {
  const activeGodIds = new Set(Object.keys(activeRituals))
  const activeRitualGods = gods.filter(g => activeGodIds.has(g.id))

  const wrathFirst = (a: { id: string; angerLevel: string }, b: { id: string; angerLevel: string }) => {
    if (a.id === wrathfulGodId) return -1
    if (b.id === wrathfulGodId) return 1
    const angerOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
    return angerOrder[a.angerLevel] - angerOrder[b.angerLevel]
  }

  const sortedGods = [...gods]
    .filter(g => !activeGodIds.has(g.id))
    .sort(wrathFirst)

  const allGodsSorted = [...gods].sort(wrathFirst)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const collapsedHeaderRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isStuck, setIsStuck] = useState(false)
  const [headerOpacity, setHeaderOpacity] = useState(1)
  const [shadowOpacity, setShadowOpacity] = useState(0)
  const [isBottomHovered, setIsBottomHovered] = useState(false)
  // showCollapsed drives which layer is visible; lags behind isExpanded on collapse
  const [showCollapsed, setShowCollapsed] = useState(true)

  useEffect(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    if (isExpanded) {
      setShowCollapsed(false)
    } else {
      // wait for the panel to finish collapsing before swapping content
      collapseTimerRef.current = setTimeout(() => {
        setShowCollapsed(true)
        if (scrollRef.current && stickyRef.current && collapsedHeaderRef.current) {
          const scrollEl = scrollRef.current
          const headerHeight = collapsedHeaderRef.current.offsetHeight
          // Reset to 0 so the sticky card is at its natural (unstuck) position,
          // then read it, then set the real target in the same frame — no paint between.
          scrollEl.scrollTop = 0
          const cardTop = stickyRef.current.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top
          scrollEl.scrollTop = cardTop - headerHeight - 12
        }
      }, 350)
    }
    return () => { if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current) }
  }, [isExpanded])

  useEffect(() => {
    setIsStuck(false)
    setHeaderOpacity(1)
  }, [selectedGodId])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollRef.current || isExpanded) return
      scrollRef.current.scrollBy({ top: e.deltaY })
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isExpanded])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleScroll = () => {
      if (cardsRef.current) cardsRef.current.style.pointerEvents = 'none'
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => {
        if (cardsRef.current) cardsRef.current.style.pointerEvents = ''
      }, 150)
      setShadowOpacity(Math.min(1, container.scrollTop / 30))
      if (!stickyRef.current) return
      const threshold = container.getBoundingClientRect().top + STICKY_TOP
      const cardTop = stickyRef.current.getBoundingClientRect().top
      setIsStuck(cardTop <= threshold + 1)
      setHeaderOpacity(Math.min(1, Math.max(0, (cardTop - threshold) / FADE_RANGE)))
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    // Outer: holds its place in the flex layout at sidebarWidth, never moves
    <div
      style={{
        width: `${LAYOUT.sidebarWidth}px`,
        height: '100vh',
        flexShrink: 0,
        position: 'relative',
        zIndex: showCollapsed ? 1 : 200,
      }}
    >
      {/* Inner panel: expands in width, clips overflow, no flex-column so both views fill it absolutely */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: isExpanded ? `${OVERLAY_WIDTH}px` : `${LAYOUT.sidebarWidth}px`,
          backgroundColor: COLORS.bgBase,
          borderRight: '1px solid #333333',
          overflow: 'hidden',
          transition: isExpanded
            ? 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Collapsed view: scrollable list with sticky header inside ── */}
        <div
          ref={scrollRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'column',
            opacity: showCollapsed ? 1 : 0,
            transition: 'none',
            pointerEvents: showCollapsed && !isExpanded ? 'auto' : 'none',
          }}
        >
          {/* Header — sticky inside scroll container so card can slide over it */}
          <div
            ref={collapsedHeaderRef}
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              backgroundColor: COLORS.bgBase,
              padding: '28px 16px 16px',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, boxShadow: '0 12px 24px rgba(0,0,0,0.9)', opacity: shadowOpacity * headerOpacity, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: '#333333', pointerEvents: 'none', opacity: headerOpacity }} />
            <div style={{ opacity: headerOpacity }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, padding: 0, fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: '#ffffff', lineHeight: '1' }}>
                  Gods
                </h2>
                <ArrowCircleDown
                  size={16}
                  color="rgba(255,255,255,0.5)"
                  style={{ cursor: 'pointer', transform: 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); onToggleExpanded?.() }}
                />
              </div>
              <p style={{ margin: '3px 0 0 0', padding: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
                Sorted by anger level
              </p>
            </div>
          </div>

          {/* Cards */}
          <div ref={cardsRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
            {sortedGods.map((god) => {
              const isSelected = selectedGodId === god.id
              return (
                <div
                  key={god.id}
                  ref={isSelected ? stickyRef : undefined}
                  style={{
                    position: isSelected ? 'sticky' : undefined,
                    top: isSelected ? STICKY_TOP : undefined,
                    zIndex: isSelected ? 10 : undefined,
                    backgroundColor: isSelected ? COLORS.bgBase : undefined,
                    marginInline: isSelected ? '-12px' : undefined,
                    paddingInline: isSelected ? '12px' : undefined,
                    paddingBottom: isSelected && isStuck ? '16px' : undefined,
                    marginBottom: isSelected && isStuck ? '-16px' : undefined,
                    borderRadius: '10px',
                    boxShadow: '0 0 24px rgba(0,0,0,0.9)',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      boxShadow: '0 12px 24px rgba(0,0,0,0.9)',
                      borderBottom: '1px solid #333333',
                      opacity: isStuck ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    }} />
                  )}
                  <GodCard
                    god={god}
                    isSelected={isSelected}
                    onClick={() => onSelect(god.id)}
                    stuckProgress={isSelected ? 1 - headerOpacity : 0}
                    wrathful={god.id === wrathfulGodId}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Expanded view: header + grid ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'column',
            opacity: showCollapsed ? 0 : 1,
            transition: 'none',
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              backgroundColor: COLORS.bgBase,
              padding: '28px 16px 16px',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: '#333333', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, padding: 0, fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: '#ffffff', lineHeight: '1' }}>
                Gods
              </h2>
              <ArrowCircleDown
                size={16}
                color="rgba(255,255,255,0.5)"
                style={{ cursor: 'pointer', transform: 'rotate(180deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); onToggleExpanded?.() }}
              />
            </div>
            <p style={{ margin: '3px 0 0 0', padding: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
              Sorted by anger level
            </p>
          </div>
          <div
            style={{
              padding: `${GRID_PADDING}px`,
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, ${GRID_CARD_WIDTH}px)`,
              gap: `${GRID_GAP}px`,
              alignContent: 'flex-start',
            }}
          >
            {allGodsSorted.map(god => (
              <div key={god.id} style={{ boxShadow: '0 0 24px rgba(0,0,0,0.9)', borderRadius: '10px' }}>
                <GodCard
                  god={god}
                  isSelected={selectedGodId === god.id}
                  onClick={() => { onSelect(god.id); if (god.id !== selectedGodId) onCloseExpanded?.() }}
                  wrathful={god.id === wrathfulGodId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Active rituals collapsed summary at bottom */}
        {activeRitualGods.length > 0 && (
          <div
            onMouseEnter={() => setIsBottomHovered(true)}
            onMouseLeave={() => setIsBottomHovered(false)}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
          >
            <div
              style={{
                overflow: 'hidden',
                maxHeight: isBottomHovered ? `${activeRitualGods.length * 90}px` : '0px',
                transition: isBottomHovered
                  ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'max-height 0.25s cubic-bezier(0.4, 0, 1, 1)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px 8px' }}>
                {activeRitualGods.map(god => (
                  <div key={god.id} style={{ borderRadius: '10px' }}>
                    <GodCard
                      god={god}
                      isSelected={selectedGodId === god.id}
                      onClick={() => onSelect(god.id)}
                      isCollapsed={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '0 12px 12px' }}>
              <ActiveRitualSummaryCard count={activeRitualGods.length} isHovered={isBottomHovered} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
