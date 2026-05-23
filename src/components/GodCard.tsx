import { useState, useEffect, useRef } from 'react'
import type { God } from '../data/gods'
import type { AngerLevel } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { GodSvg } from './GodSvg'
import tlalocRaw from '../assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from '../assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from '../assets/Gods/huitzilopochtli.svg?raw'
import tezcatlipocaRaw from '../assets/Gods/Tezcatlipoca.svg?raw'

const GOD_SVG_MAP: Record<string, string> = {
  tlaloc: tlalocRaw,
  quetzalcoatl: quetzalcoatlRaw,
  huitzilopochtli: huitzilopochtliRaw,
  tezcatlipoca: tezcatlipocaRaw,
  coyolxauhqui: quetzalcoatlRaw,
  tonatiuh: huitzilopochtliRaw,
}

function getSvgRaw(godId: string): string {
  const key = godId.replace(/-(high|medium|low|none)$/, '')
  return GOD_SVG_MAP[key] ?? tlalocRaw
}

const NAME_AREA_HEIGHT = 38
const STUCK_PADDING = 24

interface GodCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
  stuckProgress?: number
}

export function GodCard({ god, isSelected, onClick, stuckProgress = 0 }: GodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setIsHovered(false)
    const scrollParent = buttonRef.current?.closest('[style*="overflow"]') ?? window
    scrollParent.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollParent.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: `${248 - (54 - 2 * STUCK_PADDING) * stuckProgress}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: `${STUCK_PADDING * stuckProgress}px`,
        paddingBottom: `${16 - (16 - STUCK_PADDING) * stuckProgress}px`,
        backgroundColor: isSelected ? '#ffffff' : COLORS.bgBase,
        border: isSelected ? `1px solid #ffffff` : isHovered ? `1px solid #ffffff` : `1px solid #333333`,
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'none',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* God name at top */}
      <div
        style={{
          boxSizing: 'border-box',
          paddingTop: `${(8 + 4) * (1 - stuckProgress)}px`,
          paddingLeft: '6px',
          paddingRight: '6px',
          paddingBottom: `${8 * (1 - stuckProgress)}px`,
          textAlign: 'center',
          width: '100%',
          flexShrink: 0,
          height: `${NAME_AREA_HEIGHT * (1 - stuckProgress)}px`,
          opacity: Math.max(0, 1 - stuckProgress * 3),
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.cinzel,
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: isSelected ? '#000000' : isHovered ? '#F0F0F0' : '#6C6C6C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            overflow: 'hidden',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{god.name}</span>
        </h3>
      </div>

      {/* God SVG image - fixed 110×160 */}
      <div
        style={{
          position: 'relative',
          width: '125px',
          height: '194px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} isHovered={isHovered} isSelected={isSelected} />
      </div>
    </button>
  )
}
