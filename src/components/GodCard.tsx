import { useState } from 'react'
import type { God } from '../data/gods'
import type { AngerLevel } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { GodSvg } from './GodSvg'
import tlalocRaw from '../assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from '../assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from '../assets/Gods/huitzilopochtli.svg?raw'
import tezcatlipocaRaw from '../assets/Gods/Tezcatlipoca.svg?raw'
import mictlantecuhtliRaw from '../assets/Gods/Mictlantecuhtli.svg?raw'

const GOD_SVG_MAP: Record<string, string> = {
  tlaloc: tlalocRaw,
  quetzalcoatl: quetzalcoatlRaw,
  huitzilopochtli: huitzilopochtliRaw,
  tezcatlipoca: tezcatlipocaRaw,
  mictlantecuhtli: mictlantecuhtliRaw,
}

function getSvgRaw(godId: string): string {
  const key = godId.replace(/-(high|medium|low|none)$/, '')
  return GOD_SVG_MAP[key] ?? tlalocRaw
}

interface GodCardProps {
  god: God
  isSelected: boolean
  onClick: () => void
}

export function GodCard({ god, isSelected, onClick }: GodCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '248px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: '16px',
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
          padding: '8px 6px 8px',
          textAlign: 'center',
          width: '100%',
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontFamily: FONTS.cinzel,
            fontSize: '12px',
            fontWeight: isSelected ? 700 : 400,
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
          <span style={{ flexShrink: 0 }}>·</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{god.name}</span>
          <span style={{ flexShrink: 0 }}>·</span>
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
