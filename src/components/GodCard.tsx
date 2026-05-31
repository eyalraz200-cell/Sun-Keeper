import { useState, useEffect, useRef } from 'react'
import type { God } from '../data/gods'
import type { AngerLevel } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { GodSvg } from './GodSvg'
import tlalocRaw from '../assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from '../assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from '../assets/Gods/huitzilopochtli.svg?raw'
import mictlantecuhtliRaw from '../assets/Gods/Mictlantecuhtli.svg?raw'
import tezcatlipocaRaw from '../assets/Gods/Tezcatlipoca.svg?raw'
import ehecatlRaw from '../assets/Gods/Ehecatl.svg?raw'
import xiuhtecuhtliRaw from '../assets/Gods/Xiuhtecuhtli.svg?raw'
import chalchiuhtlicueRaw from '../assets/Gods/Chalchiuhtlicue.svg?raw'
import tonatiuhRaw from '../assets/Gods/Tonatiuh.svg?raw'

export const GOD_SVG_MAP: Record<string, string> = {
  tlaloc: tlalocRaw,
  quetzalcoatl: quetzalcoatlRaw,
  huitzilopochtli: huitzilopochtliRaw,
  mictlantecuhtli: mictlantecuhtliRaw,
  tezcatlipoca: tezcatlipocaRaw,
  ehecatl: ehecatlRaw,
  xiuhtecuhtli: xiuhtecuhtliRaw,
  chalchiuhtlicue: chalchiuhtlicueRaw,
  tonatiuh: tonatiuhRaw,
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
  isCollapsed?: boolean
  noBorder?: boolean
  wrathful?: boolean
}

export function GodCard({ god, isSelected, onClick, stuckProgress = 0, isCollapsed = false, noBorder = false, wrathful = false }: GodCardProps) {
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
        height: isCollapsed ? 'auto' : `${248 - (54 - 2 * STUCK_PADDING) * stuckProgress}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: isCollapsed ? '8px' : `${STUCK_PADDING * stuckProgress}px`,
        paddingBottom: isCollapsed ? '8px' : `${16 - (16 - STUCK_PADDING) * stuckProgress}px`,
        backgroundColor: wrathful ? '#FF2435' : isSelected ? '#ffffff' : COLORS.bgBase,
        border: noBorder ? 'none' : wrathful ? (isSelected || isHovered ? '1px solid #ffffff' : '1px solid #FF2435') : isSelected ? `1px solid #ffffff` : isHovered ? `1px solid #ffffff` : `1px solid #333333`,
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
          paddingTop: isCollapsed ? '0px' : `${(8 + 4) * (1 - stuckProgress)}px`,
          paddingLeft: '6px',
          paddingRight: '6px',
          paddingBottom: isCollapsed ? '0px' : `${8 * (1 - stuckProgress)}px`,
          textAlign: 'center',
          width: '100%',
          flexShrink: 0,
          height: isCollapsed ? 'auto' : `${NAME_AREA_HEIGHT * (1 - stuckProgress)}px`,
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
            color: wrathful ? (isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.90)') : isSelected ? '#000000' : isHovered ? '#F0F0F0' : '#6C6C6C',
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
      {!isCollapsed && (
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
          <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} isHovered={isHovered} isSelected={isSelected} filledEyes={wrathful} eyeGlow={wrathful} bodyColor={wrathful ? (isSelected || isHovered ? '#F0F0F0' : '#E6E6E6') : undefined} eyeAnimation={wrathful ? { fromColor: '#000000', fromWeight: 6, toColor: '#000000', toWeight: 6, delay: 0, duration: 0, id: 'wrath-card' } : undefined} />
        </div>
      )}
    </button>
  )
}
