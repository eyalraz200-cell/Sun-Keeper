import { useState, useRef, useEffect } from 'react'
import { animate } from 'framer-motion'
import type { God, Ritual } from '../../data/gods'
import { COLORS, FONTS, EYE, FONT_SIZE, FONT_WEIGHT } from '../../tokens'
import { GodSvg, type EyeAnimation } from './GodSvg'
import { FireIcon } from '../icons/FireIcon'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { PyramidIcon } from '../icons/PyramidIcon'
import { TempleIcon } from '../icons/TempleIcon'
import { RingedIcon } from '../icons/RingedIcon'
import { RitualParticipantPill } from '../ritual/RitualParticipantPill'
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

export function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function abbreviateDuration(duration: string): string {
  const num = duration.match(/\d+/)?.[0] ?? duration
  return `${num}d`
}

// Kept in sync BY CONVENTION (not a shared import — GodCard is also used standalone, e.g.
// DashboardScreen.tsx, and importing from HomeScreen.tsx would create a circular import, since
// HomeScreen already imports GodCard) with HomeScreen.tsx's AUTHORIZE_STEP_DURATION_MS, so a
// card's own pill drain and the resource bar's countdown land together.
const DRAIN_DURATION_S = 3.5

// Tweens a 0..1 progress value from 1 (full) down to 0 (drained) once `draining` goes true, then
// holds at 0 — mirrors RitualResultScreen's own useCountTween in spirit (animate()-driven, gated
// on a boolean "active" flag) but drives one shared progress fraction instead of a single raw
// integer, since this card's 4 pills all drain from their own different starting values together,
// in lockstep, rather than needing 4 independent tweens.
function useDrainProgress(draining: boolean, durationS: number): number {
  const [progress, setProgress] = useState(1)
  useEffect(() => {
    if (!draining) { setProgress(1); return }
    const controls = animate(1, 0, { duration: durationS, ease: 'easeOut', onUpdate: setProgress })
    return () => controls.stop()
  }, [draining, durationS])
  return progress
}

// Grown from 248 so the ritual panel's chosen-ritual content (pills + divider + duration)
// fits without overflow — the extra height goes entirely into the face (below), so the
// face's own top/bottom gaps to the card edges stay exactly what they were before.
export const CARD_HEIGHT = 276

const FACE_LEFT = 22
const FACE_TOP = 38
const FACE_BOTTOM_GAP = 16 // fixed — matches the original 248-tall card's face-to-bottom-edge gap
const FACE_HEIGHT = CARD_HEIGHT - FACE_TOP - FACE_BOTTOM_GAP
const FACE_WIDTH = Math.round(FACE_HEIGHT * (125 / 194)) // preserves the face SVG's original aspect ratio
const FACE_TO_CARD_GAP = 22 // matches the padding between the card's left edge and the face
const INNER_CARD_LEFT = FACE_LEFT + FACE_WIDTH + FACE_TO_CARD_GAP
const RITUAL_PANEL_WIDTH = 89
const RITUAL_PANEL_RIGHT_GAP = 12 // matches the padding between the card's right edge and the panel
// The card's total width derives from both fixed gaps — widening the panel grows the card,
// it never eats into either the face-gap or the right-edge-gap.
export const CARD_WIDTH = INNER_CARD_LEFT + RITUAL_PANEL_WIDTH + RITUAL_PANEL_RIGHT_GAP

// The authorize-stage card (stageMode) drops the frame/panel/site entirely and shows only a much
// larger face, so it isn't bound by CARD_WIDTH/FACE_WIDTH above at all — same aspect ratio, just bigger.
const STAGE_FACE_WIDTH = 260
const STAGE_FACE_HEIGHT = Math.round(STAGE_FACE_WIDTH * (194 / 125))
// Pills sit beside the face (not stretched to its width) at roughly the grid card's own ritual
// panel width — same relative face-left/pills-right arrangement as the grid card, just bigger,
// so the fly-in reads as this same card growing in place rather than its contents rearranging.
const STAGE_PILL_WIDTH = 150

type ParticipantType = 'prisoners' | 'volunteers' | 'children' | 'virgins'

interface GodCardProps {
  god: God
  isSelected?: boolean
  onClick?: () => void
  chosenRitual?: Ritual | null
  domRef?: (el: HTMLDivElement | null) => void
  onHoverChange?: (isHovered: boolean) => void
  // Set while a resource-bar tab is hovered — if the chosen ritual actually spends that
  // resource, that one tribute pill in the ritual panel lights up white (same look as the
  // CTA-hover `light` treatment), tying the bar back to every card its cost touches. The rest
  // of the card is unaffected — it no longer highlights as a whole for this.
  highlightParticipantType?: ParticipantType | null
  // Same idea as highlightParticipantType above, but for the ritual panel's site row (Temple/
  // Great Pyramid icon + duration) — set while the resource bar's matching ritual-site tab is
  // hovered, lights that row up if the chosen ritual's own sacredSite matches it.
  highlightSite?: 'Temple' | 'Great Pyramid' | null
  // True while the bottom action bar's CTA is hovered — previews which rituals are about to be
  // performed by reskinning this card (and only this card, since it requires a chosenRitual) into
  // a light-on-white theme instead of the default dark-on-black one. Every dark tone below gets
  // performed — only the resource pills react to it (turning white-filled); the eyes also tween
  // toward the ritual's outcome color (see eyeAnimation below), and the face brightens one step; the
  // rest of the card (border, background, name, panel) stays its regular color.
  ctaHovered?: boolean
  // This god is actively punishing the empire (see App.tsx's punishing-god flow) — reskins the
  // whole card red (Figma node 274:3705) instead of the usual dark theme, white face on top, and
  // flips the ritual panel to the same light treatment the pills' `light` prop already uses below
  // (reused rather than duplicated, since Figma's empty-panel colors land on the same values).
  isPunishing?: boolean
  // True once this card's turn has begun in HomeScreen's ritual-authorization drain sequence
  // (see authorizeStepIndex there) — tweens this card's own 4 ritual-panel pill values from their
  // real amounts down to 0 locally, once, on the false->true transition, and keeps them blank at 0
  // for as long as this stays true. Every other caller leaves this undefined, reproducing today's
  // static pill display exactly (see RitualParticipantPill's own liveValue prop).
  draining?: boolean
  // The ritual actually authorized and now running for this god (see HomeScreen's
  // inProgressRituals) — distinct from chosenRitual, which only reflects a not-yet-authorized pick
  // and is cleared the instant authorization finalizes. Renders a deliberately inert look instead —
  // darker face/eyes/name, no ritual-panel border, a plain "Ritual in progress" label instead of
  // the usual pill list — and takes priority over hover/selected/dimmed/lightMode, none of which
  // matter anymore once a ritual is actually underway.
  ritualInProgress?: Ritual | null
  // True only for the centered "authorize stage" card (see HomeScreen's fly-to-center animation) —
  // holds the eyes at the god's own base anger-level color instead of the chosen ritual's outcome
  // color, up until this card's own `draining` turn begins. Without this, the eyes would already be
  // showing the outcome color the instant the animation starts (they've shown it since the ritual
  // was first picked in the grid) instead of visibly shifting color as the god "eats" its tribute.
  holdBaseEyes?: boolean
  // True only for the centered "authorize stage" card — the look this card needs there differs
  // from every other caller in three ways, bundled into one flag since they're never used apart:
  // the face steps two brightness keys up (gray30->gray60), the fire icon and any pill for a
  // resource this ritual doesn't spend are hidden entirely instead of shown dim/inactive, and the
  // remaining (active) pills always render white-filled rather than only on ctaHovered/highlight.
  stageMode?: boolean
}

export function GodCard({ god, isSelected, onClick, chosenRitual, domRef, onHoverChange, highlightParticipantType, highlightSite, ctaHovered, isPunishing, draining, ritualInProgress, holdBaseEyes, stageMode }: GodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const drainProgress = useDrainProgress(!!draining, DRAIN_DURATION_S)
  const inProgress = !!ritualInProgress
  const highlighted = !inProgress && (isSelected || isHovered)
  // Only the resource pills react to this (turning white-filled) — the rest of the card (border,
  // background, name, face, panel) stays its regular color while the CTA is hovered.
  const lightMode = !inProgress && !!ctaHovered && !!chosenRitual
  // The flip side of lightMode: a card with no chosen ritual isn't part of the batch about to be
  // authorized, so while the CTA is hovered it steps one key darker instead (background, border,
  // name, face) to read as "not relevant" next to the lightMode cards. Eyes are deliberately left
  // out — anger state should stay legible even on a dimmed card.
  const dimmed = !inProgress && !!ctaHovered && !chosenRitual && !highlighted
  // The ritual panel's light-vs-dark treatment — true only for the punishing state now (lightMode
  // no longer reskins the panel itself, see above), and only while NOT hovered/selected — hovering
  // a punishing card flips it back to the normal dark panel (falls through to the existing
  // highlighted-dark branches below) instead of staying light the whole time.
  const panelLight = isPunishing && !highlighted
  // The chosen (or, once authorized, in-progress) ritual's outcome eye style — used below to
  // animate the god's eyes toward it. The ritual panel's border used to tint toward this same
  // color (a gradient fading into gray) instead, but that's been removed: the eye animation now
  // shows the ritual's effect directly on the god's own face, so the panel border stays a plain
  // flat color (or, once in progress, no border at all — see the panel style below).
  const activeRitual = ritualInProgress ?? chosenRitual
  const outcome = activeRitual ? outcomeEye(activeRitual.outcomeColor) : null

  // The face is raw injected SVG markup (dangerouslySetInnerHTML), which regenerates wholesale on
  // every render — a plain CSS `transition` on a `fill` attribute has no persisting element to
  // transition from/to, so it would otherwise snap instantly (see GodSvg's BodyColorAnimation
  // doc). Track the previous color and hand GodSvg an explicit from/to pair whenever it changes,
  // mirroring HomeGodDetailPanel's eyeAnim pattern, so the face tweens like everything else here.
  // On hover, a god with a chosen ritual ("relevant") steps one brightness key brighter than the
  // usual hover color (gray95→white) — independent of ctaHovered, since the card itself is what's
  // being hovered here. While the CTA is hovered, the face also steps one key up from whatever it'd
  // otherwise be when not card-hovered (gray30→gray40), or one key down (gray30→gray20) for dimmed
  // (not-relevant) cards — same one-step-along-the-scale rule as any other "brighter"/"darker" ask.
  // A ritual actually in progress steps all the way down to gray18 — noticeably darker than even
  // the dimmed/not-relevant look above, so the face reads as "resting/spent" rather than "hover me".
  const bodyColor = isPunishing
    ? (highlighted ? COLORS.gray0 : COLORS.white)
    : inProgress
      ? COLORS.gray18
      : highlighted
        ? (chosenRitual ? COLORS.white : COLORS.gray95)
        : dimmed
          ? COLORS.gray20
          : stageMode
            // Waiting for its turn: two steps brighter than the usual gray30. Once its own
            // drain turn begins, the face goes fully white and stays there — draining never
            // reverts to false once true, so this also covers "done, remains white".
            ? (draining ? COLORS.white : COLORS.gray60)
            : (lightMode ? COLORS.gray40 : COLORS.gray30)
  const bodyAnimKeyRef = useRef(0)
  const [prevBodyColor, setPrevBodyColor] = useState(bodyColor)
  const [bodyColorAnimation, setBodyColorAnimation] = useState<{ fromColor: string; toColor: string; duration: number; id: string } | undefined>(undefined)
  // Adjusted during render rather than in a useEffect: an effect-based update commits the new
  // bodyColor prop one paint ahead of the animation state that's supposed to explain how to get
  // there, so GodSvg briefly regenerates its markup using the previous (now-stale) animation
  // object before the effect fires and forces a second regeneration a tick later — two
  // dangerouslySetInnerHTML replacements per hover instead of one, which is what read as jitter.
  // Calling setState here, guarded by a value check, folds both changes into the same render pass.
  if (bodyColor !== prevBodyColor) {
    bodyAnimKeyRef.current += 1
    setBodyColorAnimation({ fromColor: prevBodyColor, toColor: bodyColor, duration: 0.4, id: `body-${bodyAnimKeyRef.current}` })
    setPrevBodyColor(bodyColor)
  }

  // Once a ritual is chosen for this god, its eyes always show that ritual's outcome color instead
  // of the god's current anger-level color — no hover/CTA gating, it just reflects the new effect
  // as soon as it's picked (and back to the base anger eyes the moment it's un-chosen) — the same
  // fromColor/toColor tween GodSvg already exposes (see HomeGodDetailPanel's identical eyeAnim
  // pattern for docking/undocking a ritual). Once actually in progress, the same outcome color is
  // kept but faded toward the background (via hexToRgba, not a new hand-picked hex) rather than
  // shown at full strength — legible enough to still read as "this is what it's becoming", muted
  // enough to match the rest of the card's inert look.
  const baseEye = EYE[god.angerLevel]
  // Punishing wins over everything else here — a red eye ring would nearly disappear against the
  // card's own red fill, so it goes black instead, at the same weight the anger level would've
  // used. Stays black on hover/select too — no flipping back to the anger-level red.
  // holdBaseEyes (the authorize-stage card only) keeps the eyes on the base anger color for as
  // long as this card hasn't started draining yet — once draining begins, it falls through to the
  // same outcome-color target as everywhere else, so the eyeAnimation tween below carries it from
  // anger color to outcome color over the drain itself instead of showing outcome color upfront.
  const eyeTarget = isPunishing
    ? { color: COLORS.gray0, weight: baseEye.weight }
    : inProgress && outcome
      ? { color: hexToRgba(outcome.color, 0.45), weight: outcome.weight }
      : holdBaseEyes && !draining
        ? baseEye
        : (outcome ?? baseEye)
  const eyeAnimKeyRef = useRef(0)
  const [prevEye, setPrevEye] = useState(eyeTarget)
  // If this card mounts fresh with a ritual already chosen/in progress (e.g. returning to the grid
  // after picking one in the detail view — the grid fully remounts on that transition, it doesn't
  // just re-render), prevEye above already equals eyeTarget, so the check below would never see a
  // "change" and would leave eyeAnimation undefined forever — which makes GodSvg fall back to
  // the plain angerLevel-based color, silently ignoring the chosen ritual. Seed it with a
  // from===to pair (mirrors HomeGodDetailPanel's identical already-docked-on-mount handling) so
  // GodSvg's animated render path is used from the start, holding at the correct color with no
  // visible animation.
  const [eyeAnimation, setEyeAnimation] = useState<EyeAnimation | undefined>(
    activeRitual ? { fromColor: eyeTarget.color, fromWeight: eyeTarget.weight, toColor: eyeTarget.color, toWeight: eyeTarget.weight, delay: 0, duration: 0 } : undefined
  )
  // Adjusted during render (same reasoning as bodyColorAnimation above) rather than in a
  // useEffect — folding the animation-state update into the same render as the eyeTarget change
  // avoids a stale-then-corrected double regeneration of GodSvg's markup, which is what caused
  // the face to visibly flash/jitter right as a ritual was chosen or hover ended. Stays set
  // permanently once triggered rather than reverting to undefined — see GodSvg's own
  // dangerouslySetInnerHTML doc for why a later flip back to undefined would restart everything.
  if (prevEye.color !== eyeTarget.color || prevEye.weight !== eyeTarget.weight) {
    eyeAnimKeyRef.current += 1
    // While actively draining, the eye shift plays out over the same DRAIN_DURATION_S as the
    // pills above instead of the usual snappy 0.4s hover/choice tween — "eating" the resources
    // and turning appeased are meant to read as the same, single, gradual event.
    const duration = draining ? DRAIN_DURATION_S : 0.4
    setEyeAnimation({ fromColor: prevEye.color, fromWeight: prevEye.weight, toColor: eyeTarget.color, toWeight: eyeTarget.weight, delay: 0, duration, id: `eye-${god.id}-${eyeAnimKeyRef.current}` })
    setPrevEye(eyeTarget)
  }

  // The authorize-stage card is a deliberately stripped-down look — no outer frame, no ritual
  // panel/site, just the (enlarged) face, name, and the pills themselves — different enough from
  // the grid/list layout below that it's its own branch rather than more conditionals threaded
  // through the absolute-positioned name/face/panel layout. Still carries the same
  // `data-flip-id={god.id}:card` as the grid card, which is all HomeScreen's authorize-stage Flip
  // actually targets (the grid<->list hero transition's own :name/:face/:panel targets don't apply
  // here — a stage card and a grid<->list hero card are never the same DOM instance).
  if (stageMode) {
    const nameColor = isPunishing ? (highlighted ? COLORS.gray0 : COLORS.white) : highlighted ? COLORS.gray95 : dimmed ? COLORS.gray30 : COLORS.gray40
    return (
      <div ref={domRef} data-flip-id={`${god.id}:card`} className="color-transition-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontFamily: FONTS.spectral, fontSize: '13px', fontWeight: FONT_WEIGHT.light, color: nameColor, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.15s ease-out' }}>
          {god.name}
        </div>
        {/* Face left, pills right — same relative arrangement as the grid card's face-left/
            panel-right layout, just bigger, so the fly-in reads as this card growing in place
            rather than its contents jumping to a new arrangement. */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: `${STAGE_FACE_WIDTH}px`, height: `${STAGE_FACE_HEIGHT}px`, flexShrink: 0 }}>
            <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} bodyColor={bodyColor} bodyColorAnimation={bodyColorAnimation} eyeAnimation={eyeAnimation} instanceId={`stage-${god.id}`} />
          </div>
          {chosenRitual && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: `${STAGE_PILL_WIDTH}px`,
                flexShrink: 0,
                // Once this card's own drain finishes, the pills fade away entirely instead of
                // sitting there drained — the face stays white, only the tributes disappear.
                opacity: drainProgress <= 0 ? 0 : 1,
                transition: 'opacity 0.6s ease',
              }}
            >
              {([
                { key: 'prisoners', Icon: PrisonerIcon },
                { key: 'volunteers', Icon: VolunteerIcon },
                { key: 'children', Icon: ChildrenIcon },
                { key: 'virgins', Icon: VirginIcon },
              ] as const)
                // Only the participant types this ritual actually spends are shown at all.
                .filter(({ key }) => chosenRitual.participants[key] > 0)
                .map(({ key, Icon }) => (
                  <RitualParticipantPill key={key} Icon={Icon} active value={chosenRitual.participants[key]} light liveValue={draining ? Math.round(chosenRitual.participants[key] * drainProgress) : undefined} round={key !== 'virgins'} />
                ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={domRef}
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true) }}
      onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false) }}
      // A 4th GSAP Flip target, alongside name/face/panel — the outer frame (border/background/
      // shadow) itself, matching HomeGodDetailPanel's own combined-card wrapper. Without this the
      // three inner pieces flew to their new spots correctly but the box drawn around them just
      // popped from the small grid frame to the big list frame in a single instant tick, so it
      // never read as "the card becomes the new card" — only its contents did.
      data-flip-id={`${god.id}:card`}
      // fill/stroke transitions for the plain SVG icon components nested below (FireIcon,
      // RingedIcon's Temple/PyramidIcon, each RitualParticipantPill's Icon) — those set color via
      // a `fill` attribute rather than an inline style, so they need a CSS rule reaching them
      // rather than a `transition` in this file's own style objects. See index.css.
      className="color-transition-group"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        flexShrink: 0,
        position: 'relative',
        borderRadius: '4px',
        // A ritual actually in progress drops both the drop shadow and the outer stroke — the
        // card is meant to read as flat/inert, not as a raised, interactive-looking surface.
        boxShadow: inProgress ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
        cursor: onClick ? 'pointer' : undefined,
        backgroundColor: isPunishing ? EYE.high.color : COLORS.cardBg,
        backgroundImage: isPunishing
          ? 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)'
          : undefined,
        border: inProgress ? 'none' : `1px solid ${isPunishing ? 'rgba(77,77,77,0.56)' : highlighted ? COLORS.gray30 : dimmed ? COLORS.gray13 : COLORS.gray15}`,
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}
    >
      {/* Three independent GSAP Flip targets live on this card — name, face, and ritual panel
          (see handleSelectGod/handleBack in HomeScreen.tsx) — each capturing/animating its own
          rect into its corresponding list-view element (HomeGodDetailPanel's header, face box,
          and drop-zone respectively) instead of one flip on the whole heterogeneous card. A single
          whole-card flip stretched everything non-uniformly as one blob, since the grid card and
          the list's combined card have completely different proportions; flipping each meaningful
          part separately lets the card visually "become" its expanded self piece by piece. */}
      <div
        data-flip-id={`${god.id}:name`}
        style={{
          position: 'absolute',
          top: '12px',
          left: '6px',
          width: `${INNER_CARD_LEFT - 12}px`,
          textAlign: 'center',
          fontFamily: FONTS.spectral,
          fontSize: '13px',
          fontWeight: FONT_WEIGHT.light,
          color: isPunishing ? (highlighted ? COLORS.gray0 : COLORS.white) : inProgress ? COLORS.gray20 : highlighted ? COLORS.gray95 : dimmed ? COLORS.gray30 : COLORS.gray40,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color 0.15s ease-out',
        }}
      >
        {god.name}
      </div>
      <div data-flip-id={`${god.id}:face`} style={{ position: 'absolute', left: `${FACE_LEFT}px`, top: `${FACE_TOP}px`, width: `${FACE_WIDTH}px`, height: `${FACE_HEIGHT}px` }}>
        <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel={god.angerLevel} isHovered={highlighted} bodyColor={bodyColor} bodyColorAnimation={bodyColorAnimation} eyeAnimation={eyeAnimation} glow={god.angerLevel === 'high' && !chosenRitual && !inProgress} instanceId={`grid-${god.id}`} />
      </div>
      <div
        data-flip-id={`${god.id}:panel`}
        style={{
          position: 'absolute',
          left: `${INNER_CARD_LEFT}px`,
          right: `${RITUAL_PANEL_RIGHT_GAP}px`,
          top: '14px',
          bottom: '14px',
          borderRadius: '4px',
          transition: 'background-color 0.4s ease, border-color 0.4s ease',
          ...(inProgress
            ? { border: 'none', backgroundColor: 'transparent' }
            : chosenRitual
              ? {
                  border: `1px solid ${panelLight ? COLORS.gray30 : highlighted ? COLORS.gray60 : COLORS.gray40}`,
                  backgroundColor: panelLight ? COLORS.gray95 : highlighted ? COLORS.gray13 : COLORS.cardBg,
                }
              : {
                  border: `1px dashed ${panelLight ? COLORS.gray60 : highlighted ? COLORS.gray60 : dimmed ? COLORS.gray20 : COLORS.gray30}`,
                  backgroundColor: panelLight ? COLORS.gray95 : highlighted ? COLORS.gray13 : 'transparent',
                }),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: chosenRitual && !inProgress ? 'flex-start' : 'center',
          paddingTop: chosenRitual && !inProgress ? '12px' : undefined,
          paddingBottom: chosenRitual && !inProgress ? '12px' : undefined,
          paddingLeft: chosenRitual && !inProgress ? '11px' : undefined,
          paddingRight: chosenRitual && !inProgress ? '11px' : undefined,
          boxSizing: 'border-box',
        }}
      >
        {inProgress ? (
          <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: COLORS.gray30, textAlign: 'center' }}>Ritual in progress</span>
        ) : chosenRitual ? (
          <>
            <div style={{ marginBottom: '8px' }}>
              <FireIcon size={20} color={panelLight ? COLORS.gray30 : COLORS.gray80} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {([
                  { key: 'prisoners', Icon: PrisonerIcon },
                  { key: 'volunteers', Icon: VolunteerIcon },
                  { key: 'children', Icon: ChildrenIcon },
                  { key: 'virgins', Icon: VirginIcon },
                ] as const).map(({ key, Icon }) => (
                  // Lights up (white fill) on CTA hover, while the resource bar's matching tab is
                  // hovered, or while the card itself is hovered/selected in grid view — the card
                  // itself no longer highlights as a whole for the CTA/resource-bar cases, only
                  // this pill does; grid hover already brightens the rest of the card too, so this
                  // just brings the relevant pills along with the same look.
                  <RitualParticipantPill key={key} Icon={Icon} active={chosenRitual.participants[key] > 0} value={chosenRitual.participants[key]} light={lightMode || isPunishing || highlighted || highlightParticipantType === key} liveValue={draining ? Math.round(chosenRitual.participants[key] * drainProgress) : undefined} round={key !== 'virgins'} />
                ))}
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: panelLight ? COLORS.gray60 : COLORS.gray20, transition: 'background-color 0.4s ease' }} />
              {(() => {
                // Brightens on CTA hover like the pills do, independent of panelLight (which the
                // panel itself no longer reacts to) — ring border and icon color always match.
                // Also brightens while the resource bar's matching ritual-site tab is hovered,
                // same as highlightParticipantType does for the pills above.
                const siteLit = lightMode || highlightSite === chosenRitual.sacredSite.name
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                    <RingedIcon size={26} borderColor={siteLit ? COLORS.gray95 : panelLight ? COLORS.gray30 : COLORS.gray60}>
                      {chosenRitual.sacredSite.name === 'Temple'
                        ? <TempleIcon size={14} color={siteLit ? COLORS.gray95 : panelLight ? COLORS.gray30 : COLORS.gray60} />
                        : <PyramidIcon size={14} color={siteLit ? COLORS.gray95 : panelLight ? COLORS.gray30 : COLORS.gray60} />}
                    </RingedIcon>
                    <span style={{ fontFamily: FONTS.spectral, fontSize: FONT_SIZE.md, color: panelLight ? COLORS.gray0 : COLORS.white, transition: 'color 0.4s ease' }}>/{abbreviateDuration(chosenRitual.duration)}</span>
                  </div>
                )
              })()}
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
              fontSize: FONT_SIZE.md,
              color: highlighted ? COLORS.gray80 : dimmed ? COLORS.gray30 : COLORS.gray40,
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <FireIcon size={20} color={highlighted ? COLORS.gray80 : dimmed ? COLORS.gray30 : COLORS.gray40} />
            </div>
            <span>No ritual chosen</span>
          </div>
        )}
      </div>
    </div>
  )
}
