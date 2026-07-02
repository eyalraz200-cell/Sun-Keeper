import { useState } from 'react'
import type { God, Ritual } from '../../data/gods'
import { COLORS, FONTS, EYE, FONT_SIZE, FONT_WEIGHT } from '../../tokens'
import { GodSvg } from './GodSvg'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import tlalocRaw from '../../assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from '../../assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from '../../assets/Gods/huitzilopochtli.svg?raw'
import mictlantecuhtliRaw from '../../assets/Gods/Mictlantecuhtli.svg?raw'
import tezcatlipocaRaw from '../../assets/Gods/Tezcatlipoca.svg?raw'
import ehecatlRaw from '../../assets/Gods/Ehecatl.svg?raw'
import xiuhtecuhtliRaw from '../../assets/Gods/Xiuhtecuhtli.svg?raw'
import chalchiuhtlicueRaw from '../../assets/Gods/Chalchiuhtlicue.svg?raw'
import tonatiuhRaw from '../../assets/Gods/Tonatiuh.svg?raw'

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
  if (color === '#c8322e') return EYE.high
  if (color === '#d4662a') return EYE.medium
  if (color === '#d4a83c') return EYE.low
  return { color: COLORS.white, weight: 2 }
}

function abbreviateDuration(duration: string): string {
  const num = duration.match(/\d+/)?.[0] ?? duration
  return `${num}d`
}

export const CARD_HEIGHT = 248

const FACE_LEFT = 22
const FACE_WIDTH = 125
const FACE_TO_CARD_GAP = 22 // matches the padding between the card's left edge and the face
const INNER_CARD_LEFT = FACE_LEFT + FACE_WIDTH + FACE_TO_CARD_GAP
const RITUAL_PANEL_WIDTH = 112
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

// Each participant type gets its own pill: filled gray20 when the ritual actually uses it,
// near-invisible gray18-on-gray15 "ghost" when it doesn't — same information as the old
// whole-row opacity dimming, but via existing color-scale tokens instead of an opacity value.
function RitualParticipantPill({ Icon, active, value }: { Icon: React.ComponentType<{ size?: number; color?: string }>; active: boolean; value: number }) {
  const color = active ? COLORS.white : COLORS.gray18
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box', padding: '4px 6px', borderRadius: '8px', backgroundColor: active ? COLORS.gray20 : COLORS.gray15 }}>
      <Icon size={16} color={color} />
      <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color }}>{active ? value : '-'}</span>
    </div>
  )
}

export function GodCard({ god, isSelected, onClick, chosenRitual, domRef }: GodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const highlighted = isSelected || isHovered
  // Once a ritual is chosen, the outer border becomes a gradient from the god's current
  // anger-eye color to the chosen ritual's outcome-eye color — visualizing the appeasement
  // effect (before -> after) directly on the card, which is why the separate outcome circle
  // that used to live inside the ritual panel is no longer needed.
  const borderGradient = chosenRitual
    ? `linear-gradient(to right, ${EYE[god.angerLevel].color}, ${outcomeEye(chosenRitual.outcomeColor).color})`
    : null
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
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        cursor: onClick ? 'pointer' : undefined,
        ...(borderGradient
          ? {
              border: '1px solid transparent',
              backgroundImage: `linear-gradient(${COLORS.black}, ${COLORS.black}), ${borderGradient}`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }
          : {
              backgroundColor: COLORS.black,
              border: `1px solid ${highlighted ? COLORS.gray30 : COLORS.gray15}`,
            }),
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
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.regular,
          color: highlighted ? COLORS.gray95 : COLORS.gray40,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 0.15s ease-out',
        }}
      >
        {god.name}
      </div>
      <div style={{ position: 'absolute', left: `${FACE_LEFT}px`, top: '38px', width: `${FACE_WIDTH}px`, height: '194px' }}>
        <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} isHovered={highlighted} bodyColor={highlighted ? COLORS.gray95 : undefined} instanceId={`grid-${god.id}`} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${INNER_CARD_LEFT}px`,
          right: `${RITUAL_PANEL_RIGHT_GAP}px`,
          top: '14px',
          bottom: '14px',
          border: `1px ${chosenRitual ? 'solid' : 'dashed'} ${highlighted ? COLORS.gray40 : chosenRitual ? COLORS.gray30 : COLORS.gray20}`,
          borderRadius: '10px',
          backgroundColor: highlighted ? COLORS.gray18 : 'transparent',
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
              <FireIcon size={20} color={COLORS.gray60} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: 'auto', marginBottom: '8px' }}>
              {([
                { key: 'prisoners', Icon: PrisonerIcon },
                { key: 'volunteers', Icon: VolunteerIcon },
                { key: 'children', Icon: ChildrenIcon },
                { key: 'virgins', Icon: VirginIcon },
              ] as const).map(({ key, Icon }) => (
                <RitualParticipantPill key={key} Icon={Icon} active={chosenRitual.participants[key] > 0} value={chosenRitual.participants[key]} />
              ))}
            </div>
            <div style={{ width: '60%', height: '1px', backgroundColor: COLORS.gray20, marginBottom: '8px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PyramidIcon size={16} color={COLORS.gray60} />
              <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: COLORS.white }}>/{abbreviateDuration(chosenRitual.duration)}</span>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              fontFamily: FONTS.spectral,
              fontSize: FONT_SIZE.sm,
              color: highlighted ? COLORS.gray60 : COLORS.gray30,
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <FireIcon size={20} color={highlighted ? COLORS.gray60 : COLORS.gray30} />
            </div>
            <span>No ritual chosen</span>
          </div>
        )}
      </div>
    </div>
  )
}
