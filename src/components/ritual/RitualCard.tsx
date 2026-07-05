import { useState } from 'react'
import type { Ritual } from '../../data/gods'
import { FONTS, COLORS, EYE, FONT_SIZE, FONT_WEIGHT } from '../../tokens'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { TempleIcon } from '../icons/TempleIcon'
import { RingedIcon } from '../icons/RingedIcon'
import { RitualParticipantPill } from './RitualParticipantPill'

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Offended'
  if (color === '#d4a83c') return 'Uneasy'
  return 'Peaceful'
}

function outcomeEye(color: string): { color: string; weight: number } {
  if (color === '#c8322e') return EYE.high
  if (color === '#d4662a') return EYE.medium
  if (color === '#d4a83c') return EYE.low
  return { color: COLORS.white, weight: 2 }
}

interface RitualCardProps {
  ritual: Ritual
  isSelected: boolean
  onClick: () => void
  isActive?: boolean
  onHoverChange?: (isHovered: boolean) => void
  godName?: string
  wrathful?: boolean
  overrideOutcome?: string
  overrideParticipants?: Ritual['participants']
  overrideSite?: Ritual['sacredSite']
  overrideDuration?: string
  isCompact?: boolean
  footer?: React.ReactNode
  // When true, the border is always the ritual's own outcome-eye color, regardless of
  // selected/active/hover/wrathful — used where the card is a drag source rather than a
  // click-to-select target, so "selected" no longer means anything for its border.
  outcomeBorder?: boolean
  // Holds the pressed/grabbed pop-up scale for the whole drag, not just the instant of
  // pointerdown — the drag ghost portal (HomeGodDetailPanel) never receives its own
  // pointerdown, so without this it would sit at scale(1) while being dragged around.
  forcePopped?: boolean
  // False once the card is resting docked in the drop-zone — a floating drop shadow only
  // reads correctly while the card is "lifted" (candidate row, mid-drag); a docked card is
  // meant to look settled/flush against its slot.
  dropShadow?: boolean
  // Set while a resource-bar tab (Prisoners/Volunteers/Children/Virgins) is hovered — lights up
  // (white fill) this card's own tribute pill of that same type, if it's actually used by this
  // ritual, instead of highlighting the whole card.
  highlightParticipantType?: 'prisoners' | 'volunteers' | 'children' | 'virgins' | null
  // Set while a resource-bar ritual-site tab (Temple/Great Pyramid) is hovered — same idea as
  // highlightParticipantType above, but for the "Ritual Site" row instead of a tribute pill:
  // lights up that row (white) if this ritual's own sacredSite actually matches the hovered one.
  highlightSite?: 'Temple' | 'Great Pyramid' | null
  // Small label above the ritual name identifying its cost tier among the god's 3 rituals
  // ("Basic Ritual" / "Major Ritual" / "Supreme Ritual") — caller derives this from the
  // ritual's index in god.rituals, since this component only sees the one ritual.
  tierLabel?: string
  // True when the player doesn't have enough of some resource to afford this ritual right now
  // (caller compares ritual.participants against the live available pool) — drops the lifted
  // drop-shadow (it reads as "reachable/pick-up-able", which this card currently isn't) and
  // dims the content, the tier label most of all since that's the first thing read top-to-bottom.
  insufficientResources?: boolean
  // Which specific resource types are short (caller compares each of ritual.participants against
  // the live available pool) — draws a bright stroke on just those tribute pills, so it's clear
  // exactly which resource is blocking the ritual rather than just that "something" is.
  insufficientParticipantTypes?: ReadonlyArray<'prisoners' | 'volunteers' | 'children' | 'virgins'>
  // True when the ritual's own sacred site (Temple/Great Pyramid) doesn't have enough available
  // count to cover it — draws the same bright-stroke treatment on the "Ritual Site" row that
  // insufficientParticipantTypes draws on a tribute pill, so a site shortage is just as visible
  // as a resource shortage instead of silently doing nothing to the card.
  insufficientSite?: boolean
  // Shrinks this card's own vertical padding (root padding + the Ritual Site row's padding) —
  // set when the viewport is too short to fit the detail card + candidate row stack (see
  // compactSpacing in HomeScreen.tsx). Only affects the default (non-isCompact) render branch,
  // since isCompact is a wholly separate card variant (the ritual panel — see CLAUDE.md).
  denseSpacing?: boolean
}

export function RitualCard({ ritual, isSelected, onClick, isActive = false, onHoverChange, wrathful = false, overrideOutcome, overrideParticipants, overrideSite, overrideDuration, isCompact = false, footer, outcomeBorder = false, forcePopped = false, dropShadow = true, highlightParticipantType = null, highlightSite = null, tierLabel, insufficientResources = false, insufficientParticipantTypes = [], insufficientSite = false, denseSpacing = false }: RitualCardProps) {
  const outcomeColor = overrideOutcome ?? ritual.outcomeColor
  const participants = overrideParticipants ?? ritual.participants
  const sacredSite = overrideSite ?? ritual.sacredSite
  const duration = overrideDuration ?? ritual.duration
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const compactBorderStyle = wrathful
    ? isSelected || isActive || isHovered ? '2px solid #FF2435' : '2px solid rgba(255,36,53,0.28)'
    : isSelected || isActive || isHovered ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.18)'

  const eye = outcomeEye(outcomeColor)
  // Fill stays constant regardless of hover — only the drop shadow reacts to it (see boxShadow below).
  const cardBg = isSelected || isActive ? COLORS.gray15 : COLORS.black

  const borderStyle = wrathful
    ? isSelected || isActive || isHovered ? '2px solid #FF2435' : '2px solid rgba(255,36,53,0.28)'
    : isSelected || isActive || isHovered ? `2px solid ${COLORS.gray95}` : '2px solid rgba(255,255,255,0.18)'

  // Figma fades the outcome-color border from a low-opacity tint at the top edge
  // down to gray at the bottom — same opacity/endpoint convention GodCard.tsx's
  // chosen-ritual gradient border uses, not a full-opacity color. Unaffordable cards fade in
  // further still, on top of the whole-card opacity, so the stroke doesn't read as more "alive"
  // than the rest of a card that can't currently be picked up.
  const borderGradient = outcomeBorder
    ? `linear-gradient(to bottom, ${hexToRgba(eye.color, (eye.color === COLORS.white ? 0.65 : 0.5) * (insufficientResources ? 0.5 : 1))}, ${COLORS.gray30})`
    : null

  // Hovering or actively dragging brightens the price info (tribute pills + ritual-site row) so
  // it reads as "live" under the pointer — never on an unaffordable card, which shouldn't react.
  // Feeds the pills' own `light` prop (same white-fill treatment as the CTA-hover/resource-bar
  // preview elsewhere), rather than a separate "bright" look, so hovering a ritual card matches
  // hovering the CTA button or a resource-bar section exactly.
  const brighten = !insufficientResources && (isHovered || forcePopped)

  if (isCompact) {
    const participantItems = [
      { key: 'prisoners' as const,  label: 'Prisoners',  icon: <PrisonerIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'volunteers' as const, label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'children' as const,   label: 'Children',   icon: <ChildrenIcon  size={13} color="rgba(255,255,255,0.65)" /> },
      { key: 'virgins' as const,    label: 'Virgins',    icon: <VirginIcon    size={13} color="rgba(255,255,255,0.65)" /> },
    ]

    const labelStyle: React.CSSProperties = {
      fontFamily: FONTS.spectral,
      fontSize: FONT_SIZE.md,
      fontWeight: FONT_WEIGHT.light,
      color: 'rgba(255,255,255,0.45)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
        onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
        style={{
          width: '100%',
          height: '200px',
          padding: '0',
          backgroundColor: COLORS.black,
          border: compactBorderStyle,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Name */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontFamily: FONTS.spectral, fontWeight: FONT_WEIGHT.light, fontSize: FONT_SIZE.lg, color: isSelected || isActive || isHovered ? COLORS.white : 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {ritual.name}
          </span>
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '18px',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: isSelected || isActive ? COLORS.white : 'transparent',
            border: '1.5px solid',
            borderColor: isSelected || isActive ? COLORS.white : 'rgba(255,255,255,0.25)',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            flexShrink: 0,
          }} />
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Price row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Price</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            {participantItems.map(({ key, icon }) => {
              const active = participants[key] > 0
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: active ? 1 : 0.12 }}>
                  {icon}
                  <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>
                    {active ? participants[key] : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Details row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Details</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{sacredSite.name}</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>{duration}</span>
          </div>
        </div>

        <div style={{ height: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Appeases to row */}
        <div style={{ flex: 1, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Appeases to</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'transparent', boxShadow: `inset 0 0 0 ${eye.weight}px ${eye.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.white }}>
              {outcomeLabel(outcomeColor)}
            </span>
          </div>
        </div>
      </button>
    )
  }

  const sectionLabelStyle: React.CSSProperties = { fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.regular, letterSpacing: '1px', color: 'rgba(255,255,255,0.3)' }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); onHoverChange?.(false) }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      style={{
        width: '100%',
        height: 'auto',
        padding: denseSpacing ? '12px 20px' : '19px 20px',
        border: borderGradient ? '1px solid transparent' : borderStyle,
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',
        // outcomeBorder cards are drag sources (HomeGodDetailPanel's row/drop-zone), not
        // click-to-select targets — a plain pointer cursor doesn't read as "draggable". An
        // unaffordable card isn't pick-up-able at all, so it gets the plain non-interactive cursor.
        cursor: insufficientResources ? 'default' : outcomeBorder ? 'grab' : 'pointer',
        // Drag ghost/source stay at the card's true size (scale(1)) so it always matches the
        // drop-zone's fixed dimensions — only a plain hover (not pressed/dragged) pops it up.
        // An unaffordable card never pops up on hover — it isn't pick-up-able right now, so
        // nothing about it should react to the pointer.
        transform: !insufficientResources && !isPressed && !forcePopped && isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '12px',
        // Dimmed as a whole (not just the tier label) when unaffordable — a plain flat card
        // reads as "can't pick this up right now" without needing a separate disabled treatment.
        // Stays at this same 0.5 regardless of hover — only the content wrapper (below) dims
        // further on hover, so the border/background never shift.
        opacity: insufficientResources ? 0.5 : 1,
        textAlign: 'left',
        // A pure-black shadow barely differs from this app's own near-black page background
        // (#1A1A1A) — a plain blur (no spread) reads as invisible regardless of opacity or
        // how much clipping room it's given (verified in isolation). A positive spread radius
        // plus near-opaque alpha is what actually makes the shadow legible against this bg.
        // insufficientResources always wins — an unaffordable card shouldn't look "lifted".
        boxShadow: insufficientResources ? 'none' : !dropShadow ? 'none' : isHovered ? '0 8px 28px 3px rgba(0,0,0,0.8)' : '0 6px 18px 2px rgba(0,0,0,0.6)',
        ...(borderGradient
          ? {
              backgroundImage: `linear-gradient(${cardBg}, ${cardBg}), ${borderGradient}`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }
          : { backgroundColor: cardBg }),
      }}
    >
      {insufficientResources && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
          fontFamily: FONTS.spectral,
          fontSize: FONT_SIZE.lg,
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.gray60,
        }}>
          Insufficient Resources
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        // The card content itself is what dims to near-invisible on hover, so the overlay
        // above reads clearly against it — the outer button opacity handles the resting
        // (non-hover) flat/dimmed look instead (see opacity above).
        opacity: insufficientResources && isHovered ? 0.12 : 1,
        transition: 'opacity 0.2s ease',
      }}>
      {tierLabel && (
        <span style={{ fontFamily: FONTS.spectral, fontWeight: FONT_WEIGHT.light, fontSize: '18px', color: insufficientResources ? COLORS.gray40 : COLORS.gray95 }}>
          {tierLabel}
        </span>
      )}

      <span style={{ ...sectionLabelStyle, marginBottom: '-6px' }}>Tributes</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {([
          { key: 'prisoners', label: 'Prisoners', Icon: PrisonerIcon },
          { key: 'volunteers', label: 'Volunteers', Icon: VolunteerIcon },
          { key: 'children', label: 'Children', Icon: ChildrenIcon },
          { key: 'virgins', label: 'Virgins', Icon: VirginIcon },
        ] as const).map(({ key, label, Icon }) => (
          <RitualParticipantPill key={key} Icon={Icon} label={label} active={participants[key] > 0} value={participants[key]} variant="card" muted={insufficientResources} light={highlightParticipantType === key || brighten} round={key !== 'virgins'} insufficient={insufficientParticipantTypes.includes(key)} />
        ))}
      </div>

      <span style={{ ...sectionLabelStyle, marginTop: '4px', marginBottom: '-6px' }}>Ritual Site</span>
      {(() => {
        const siteLit = brighten || highlightSite === sacredSite.name
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: denseSpacing ? '4px 8px' : '6px 8px', borderRadius: '8px', border: `1px solid ${insufficientSite ? COLORS.gray40 : 'transparent'}` }}>
            <RingedIcon size={26} borderColor={siteLit ? COLORS.gray95 : COLORS.gray80} borderWidth={1}>
              {sacredSite.name === 'Temple'
                ? <TempleIcon size={14} color={siteLit ? COLORS.gray95 : COLORS.gray80} />
                : <PyramidIcon size={14} color={siteLit ? COLORS.gray95 : COLORS.gray80} />}
            </RingedIcon>
            <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: siteLit ? COLORS.gray95 : COLORS.gray80 }}>{sacredSite.name} / {duration}</span>
          </div>
        )
      })()}

      {footer && (
        <div onClick={e => e.stopPropagation()}>
          {footer}
        </div>
      )}

      <div style={{ height: '1px', flexShrink: 0, marginTop: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, ...sectionLabelStyle }}>Effect</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            // A literal-white ring (Peaceful outcome) is the brightest thing on the card — step
            // it down when unaffordable so it doesn't outshine the rest of the dimmed content.
            boxShadow: `inset 0 0 0 ${eye.weight}px ${insufficientResources && eye.color === COLORS.white ? COLORS.gray60 : eye.color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.light, color: COLORS.gray80 }}>
            {outcomeLabel(outcomeColor)}
          </span>
        </div>
      </div>
      </div>
    </button>
  )
}
