import { useRef, useState, useEffect, Fragment } from 'react'
import type { God } from '../data/gods'
import { GodCard } from './GodCard'
import { COLORS, FONTS, LAYOUT } from '../tokens'

interface GodListProps {
  gods: God[]
  selectedGodId: string | null
  onSelect: (godId: string) => void
}

export function GodList({ gods, selectedGodId, onSelect }: GodListProps) {
  const sortedGods = [...gods].sort((a, b) => {
    const angerOrder = { high: 0, medium: 1, low: 2, none: 3 }
    return angerOrder[a.angerLevel] - angerOrder[b.angerLevel]
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    setIsStuck(false)
    const container = scrollRef.current
    if (!container || !selectedGodId) return
    const handleScroll = () => {
      if (!stickyRef.current) return
      const paddingTop = parseFloat(getComputedStyle(container).paddingTop)
      setIsStuck(
        stickyRef.current.getBoundingClientRect().top <= container.getBoundingClientRect().top + paddingTop + 1
      )
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [selectedGodId])

  return (
    <div
      style={{
        width: `${LAYOUT.sidebarWidth}px`,
        height: '100vh',
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #333333`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h2
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.spectral,
            fontSize: '16px',
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          Deities
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            padding: 0,
            fontFamily: FONTS.spectral,
            fontSize: '14px',
            fontWeight: 400,
            color: COLORS.textSecondary,
          }}
        >
          Sorted by anger level
        </p>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          scrollbarWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
        }}
      >
        {sortedGods.map((god) => {
          const isSelected = selectedGodId === god.id
          return (
            <Fragment key={god.id}>
              <div
                ref={isSelected ? stickyRef : undefined}
                style={{
                  position: isSelected ? 'sticky' : 'relative',
                  top: isSelected ? -12 : undefined,
                  zIndex: isSelected ? 1 : 0,
                  marginInline: isSelected && isStuck ? '-12px' : undefined,
                  paddingInline: isSelected && isStuck ? '12px' : undefined,
                  paddingTop: isSelected && isStuck ? '12px' : undefined,
                  paddingBottom: isSelected && isStuck ? '16px' : undefined,
                  borderBottom: isSelected && isStuck ? '1px solid #333333' : undefined,
                  backgroundColor: isSelected ? COLORS.bgBase : undefined,
                }}
              >
                <GodCard
                  god={god}
                  isSelected={isSelected}
                  onClick={() => onSelect(god.id)}
                />
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
