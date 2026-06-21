import { useState } from 'react'
import type { God, Ritual } from '../data/gods'
import { COLORS, FONTS } from '../tokens'
import { GodSvg } from './GodSvg'
import { FireIcon } from './FireIcon'
import { PrisonerIcon } from './PrisonerIcon'
import { ChildrenIcon } from './ChildrenIcon'
import { VirginIcon } from './VirginIcon'
import { VolunteerIcon } from './VolunteerIcon'
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

// DISPLAY_GODS (HomeScreen.tsx) suffixes duplicated mock entries with "-dup-N" for unique React keys.
export function getSvgRaw(godId: string): string {
  return GOD_SVG_MAP[godId.replace(/-dup-\d+$/, '')] ?? ''
}

export function outcomeEye(color: string): { color: string; weight: number } {
  if (color === '#c8322e') return { color: '#FF2435', weight: 6 }
  if (color === '#d4662a') return { color: '#EF7B2E', weight: 4 }
  if (color === '#d4a83c') return { color: '#D7C94E', weight: 3 }
  return { color: '#ffffff', weight: 2 }
}

function abbreviateDuration(duration: string): string {
  const num = duration.match(/\d+/)?.[0] ?? duration
  return `${num}d`
}

function abbreviateSiteName(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
}

export const CARD_HEIGHT = 248

const FACE_LEFT = 22
const FACE_WIDTH = 125
const FACE_TO_CARD_GAP = 22 // matches the padding between the card's left edge and the face
const INNER_CARD_LEFT = FACE_LEFT + FACE_WIDTH + FACE_TO_CARD_GAP
const RITUAL_PANEL_WIDTH = 90
const RITUAL_PANEL_RIGHT_GAP = 12 // matches the padding between the card's right edge and the panel
// The card's total width derives from both fixed gaps — widening the panel grows the card,
// it never eats into either the face-gap or the right-edge-gap.
export const CARD_WIDTH = INNER_CARD_LEFT + RITUAL_PANEL_WIDTH + RITUAL_PANEL_RIGHT_GAP

interface GodCardProps {
  god: God
  isSelected?: boolean
  onClick?: () => void
  chosenRitual?: Ritual | null
  domRef?: (el: HTMLDivElement | null) => void
}

export function GodCard({ god, isSelected, onClick, chosenRitual, domRef }: GodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const highlighted = isSelected || isHovered
  return (
    <div
      ref={domRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        flexShrink: 0,
        position: 'relative',
        backgroundColor: COLORS.bgBase,
        border: `1px solid ${highlighted ? '#4d4d4d' : '#262626'}`,
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '6px',
          width: `${INNER_CARD_LEFT - 12}px`,
          textAlign: 'center',
          fontFamily: FONTS.cinzel,
          fontSize: '12px',
          fontWeight: 400,
          color: highlighted ? '#F0F0F0' : '#6c6c6c',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 0.15s ease-out',
        }}
      >
        {god.name}
      </div>
      <div style={{ position: 'absolute', left: `${FACE_LEFT}px`, top: '38px', width: `${FACE_WIDTH}px`, height: '194px' }}>
        <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} isHovered={highlighted} bodyColor={highlighted ? '#e0e0e0' : undefined} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${INNER_CARD_LEFT}px`,
          right: `${RITUAL_PANEL_RIGHT_GAP}px`,
          top: '14px',
          bottom: '14px',
          border: `1px ${chosenRitual ? 'solid' : 'dashed'} ${highlighted ? '#808080' : '#333333'}`,
          borderRadius: '10px',
          backgroundColor: highlighted ? '#2e2e2e' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: chosenRitual ? 'flex-start' : 'center',
          paddingTop: chosenRitual ? '12px' : undefined,
          paddingBottom: chosenRitual ? '8px' : undefined,
        }}
      >
        {chosenRitual ? (
          <>
            <div style={{ marginBottom: '8px' }}>
              <FireIcon size={20} color="#b3b3b3" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto', marginBottom: '8px' }}>
              {([
                { key: 'prisoners', Icon: PrisonerIcon },
                { key: 'volunteers', Icon: VolunteerIcon },
                { key: 'children', Icon: ChildrenIcon },
                { key: 'virgins', Icon: VirginIcon },
              ] as const).map(({ key, Icon }) => {
                const active = chosenRitual.participants[key] > 0
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: active ? 1 : 0.12 }}>
                    <Icon size={16} color="#ffffff" />
                    <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: '#ffffff' }}>{active ? chosenRitual.participants[key] : '—'}</span>
                  </div>
                )
              })}
              <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', color: '#ffffff', textAlign: 'center' }}>
                {abbreviateSiteName(chosenRitual.sacredSite.name)} / {abbreviateDuration(chosenRitual.duration)}
              </span>
            </div>
            <div style={{ width: '60%', height: '1px', backgroundColor: '#333333', marginBottom: '8px' }} />
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                boxShadow: `inset 0 0 0 ${outcomeEye(chosenRitual.outcomeColor).weight}px ${outcomeEye(chosenRitual.outcomeColor).color}`,
              }}
            />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              fontFamily: FONTS.spectral,
              fontSize: '13px',
              color: highlighted ? '#999999' : '#4d4d4d',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <FireIcon size={20} color={highlighted ? '#999999' : '#4d4d4d'} />
            </div>
            <span>No Ritual</span>
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  )
}
