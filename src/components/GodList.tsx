import { useRef, useState, useEffect } from 'react'
import type { God } from '../data/gods'
import { GodCard } from './GodCard'
import { COLORS, FONTS, LAYOUT } from '../tokens'

interface GodListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
}

const STICKY_TOP = 24
const FADE_RANGE = 80

export function GodList({ gods, selectedGodId, onSelect }: GodListProps) {
  const sortedGods = [...gods].sort((a, b) => {
    const angerOrder = { high: 0, medium: 1, low: 2, none: 3 }
    return angerOrder[a.angerLevel] - angerOrder[b.angerLevel]
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isStuck, setIsStuck] = useState(false)
  const [headerOpacity, setHeaderOpacity] = useState(1)
  const [shadowOpacity, setShadowOpacity] = useState(0)

  useEffect(() => {
    setIsStuck(false)
    setHeaderOpacity(1)
  }, [selectedGodId])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollRef.current) return
      scrollRef.current.scrollBy({ top: e.deltaY })
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

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
    <div
      style={{
        width: `${LAYOUT.sidebarWidth}px`,
        height: '100vh',
        flexShrink: 0,
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #333333`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          scrollbarWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header — sticky at top of scroll container = top of sidebar */}
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
          <div style={{ position: 'absolute', inset: 0, boxShadow: '0 12px 24px rgba(0,0,0,0.9)', opacity: shadowOpacity * headerOpacity, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: '#333333', pointerEvents: 'none' }} />
          <div style={{ opacity: headerOpacity }}>
            <h2
              style={{
                margin: 0,
                padding: 0,
                fontFamily: FONTS.spectral,
                fontSize: '16px',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: '1',
              }}
            >
              Gods
            </h2>
            <p
              style={{
                margin: '3px 0 0 0',
                padding: 0,
                fontFamily: FONTS.spectral,
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Sorted by anger level
            </p>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
          }}
        >
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
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
