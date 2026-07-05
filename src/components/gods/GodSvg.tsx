import { memo } from 'react'
import type { AngerLevel } from '../../data/gods'
import { EYE, COLORS } from '../../tokens'

const EYE_STYLES: Record<AngerLevel, { color: string; weight: number }> = EYE

const SELECTED_EYE_OVERRIDES: Partial<Record<AngerLevel, string>> = {
  medium: '#FF7913',
  low:    '#E7C104',
  none:   COLORS.gray0,
}

export interface EyeAnimation {
  fromColor: string
  fromWeight: number
  toColor: string
  toWeight: number
  delay?: number
  duration?: number
  id?: string
}

// Animates the body fill from one flat color to another — same CSS-@keyframes-on-fresh-markup
// technique EyeAnimation uses, needed because dangerouslySetInnerHTML replaces the DOM subtree
// wholesale every render, so a plain CSS `transition` on `fill` never has a persisting element
// to transition from/to.
export interface BodyColorAnimation {
  fromColor: string
  toColor: string
  duration?: number
  id?: string
}

export interface GodSvgProps {
  svgRaw: string
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
  eyeAnimation?: EyeAnimation
  filledEyes?: boolean
  eyeGlow?: boolean
  bodyColor?: string
  bodyColorAnimation?: BodyColorAnimation
  // Static override for the eye stroke/fill color, taking precedence over the anger-level lookup
  // (and any isSelected/hover tint) — the punishing-god treatment needs black eyes against its red
  // card background, since the normal red ring would nearly disappear against a red fill. Every
  // other caller leaves this unset and gets the usual EYE-token-driven color.
  eyeColor?: string
  hideEyes?: boolean
  // Pulsing glow behind the eye circles, colored to the eye's own stroke color.
  // Currently only used for high-anger ("Furious") gods in the overview grid.
  glow?: boolean
  // Salts every generated clipPath id. Multiple GodSvg instances for the same god (duplicated
  // mock data, or the same god mounted in both the grid and an expanded panel at once) render
  // identical source markup, so without a per-instance salt their clipPath ids collide across
  // the document. Chromium then sometimes resolves a clip-path url() to a duplicate id sitting
  // inside a visibility:hidden subtree elsewhere on the page, which silently fails to clip
  // anything (the eye ring renders as a full unclipped circle). Pass something unique per
  // mounted instance, e.g. the god's id, to keep every instance's ids collision-free.
  instanceId?: string
}

function parseCircles(eyesBlock: string) {
  const circles: { cx: string; cy: string; r: string }[] = []
  const re = /<circle[^>]*>/g
  let m
  while ((m = re.exec(eyesBlock)) !== null) {
    const attr = (name: string) => m![0].match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? ''
    circles.push({ cx: attr('cx'), cy: attr('cy'), r: attr('r') })
  }
  return circles
}

function GodSvgImpl({ svgRaw, angerLevel, isHovered = false, isSelected = false, eyeAnimation, filledEyes = false, eyeGlow = false, bodyColor: bodyColorOverride, bodyColorAnimation, eyeColor: eyeColorOverride, hideEyes = false, glow = false, instanceId = '' }: GodSvgProps) {
  const idSalt = instanceId ? `${instanceId.replace(/[^a-zA-Z0-9-]/g, '')}-` : ''
  const baseEye = EYE_STYLES[angerLevel]
  let eye = isSelected
    ? { color: SELECTED_EYE_OVERRIDES[angerLevel] ?? baseEye.color, weight: baseEye.weight }
    : isHovered && angerLevel === 'none'
    ? { color: COLORS.gray95, weight: 2 }
    : baseEye
  if (eyeColorOverride) eye = { ...eye, color: eyeColorOverride }

  const bodySvg = svgRaw
    .replace(/fill="black"/g, `fill="${COLORS.gray40}"`)
    .replace(/fill="white"/g, `fill="${COLORS.gray40}"`)
    .replace(/fill="#[Ff][Ee][Ff][Ee][Ff][Ee]"/g, `fill="${COLORS.gray40}"`)
  const bodyColor = bodyColorOverride ?? (isSelected ? COLORS.gray0 : isHovered ? COLORS.gray95 : COLORS.gray40)
  // Animated variant bakes a CSS @keyframes fill transition into the fresh markup instead of a
  // flat fill attribute — see BodyColorAnimation above for why a plain CSS transition can't work.
  const bodyAnimName = bodyColorAnimation ? `bodyShift-${idSalt}${bodyColorAnimation.id ?? 'body'}` : ''
  const bodyAnimStyle = bodyColorAnimation
    ? `<style>@keyframes ${bodyAnimName} { 0% { fill: ${bodyColorAnimation.fromColor}; } 100% { fill: ${bodyColorAnimation.toColor}; } }</style>`
    : ''
  const coloredBody = bodyColorAnimation
    ? bodySvg.replace(new RegExp(`fill="${COLORS.gray40}"`, 'g'), `fill="${bodyColorAnimation.toColor}" style="animation: ${bodyAnimName} ${bodyColorAnimation.duration ?? 0.3}s ease forwards"`)
    : bodySvg.replace(new RegExp(`fill="${COLORS.gray40}"`, 'g'), `fill="${bodyColor}"`)

  const eyesMatch = coloredBody.match(/<g id="eyes">([\s\S]*?)<\/g>/)
  const eyesContent = eyesMatch?.[1] ?? ''

  let eyesGroup: string

  if (/<circle/.test(eyesContent)) {
    // Circle-based eyes: replace with inside-stroke technique
    const circles = parseCircles(eyesContent)

    if (hideEyes) {
      const eyeCircles = circles.map((c) =>
        `<circle cx="${c.cx}" cy="${c.cy}" r="${(parseFloat(c.r) * 0.20).toFixed(1)}" fill="${COLORS.white}"/>`
      ).join('\n')
      eyesGroup = `<g id="eyes">\n${eyeCircles}\n</g>`
    } else if (filledEyes) {
      const eyeColor = eyeAnimation ? eyeAnimation.toColor : eye.color
      const defs = circles.map((c) => {
        const uid = idSalt + c.cx.replace('.', '')
        return `<clipPath id="eg-${uid}"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/></clipPath>`
      }).join('\n')
      const eyeCircles = circles.map((c) => {
        const r = parseFloat(c.r)
        const uid = idSalt + c.cx.replace('.', '')
        const rings = eyeGlow ? [
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.88).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.35"/>`,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.74).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.25"/>`,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.60).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.17"/>`,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.46).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.11"/>`,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.32).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.07"/>`,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 0.18).toFixed(1)}" fill="none" stroke="${COLORS.white}" stroke-width="1.3" opacity="0.04"/>`,
        ].join('\n') : ''
        return [
          `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${eyeColor}"/>`,
          rings,
          `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" stroke="${bodyColor}" stroke-width="1" clip-path="url(#eg-${uid})"/>`,
        ].join('\n')
      }).join('\n')
      eyesGroup = `<defs>\n${defs}\n</defs>\n<g id="eyes">\n${eyeCircles}\n</g>`
    } else {

    const defs = circles.map((c) => {
      const uid = idSalt + c.cx.replace('.', '')
      return `<clipPath id="ec-${uid}"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/></clipPath>`
    }).join('\n')

    if (eyeAnimation) {
      const { fromColor: rawFromColor, fromWeight, toColor: rawToColor, toWeight, delay = 0.8, duration = 2, id = 'ritual' } = eyeAnimation
      // eyeColorOverride wins here too, not just in the plain (no-eyeAnimation) branch below —
      // otherwise a caller mid-animating eyes toward a ritual's outcome color (HomeGodDetailPanel's
      // dock/undock tween) would silently ignore the override the instant a ritual gets docked.
      // From===to when overridden, so there's simply no visible color animation while it's set.
      const fromColor = eyeColorOverride ?? rawFromColor
      const toColor = eyeColorOverride ?? rawToColor
      // Unlike bodyAnimName above, this wasn't salted with idSalt — `id` alone (e.g. a small
      // per-instance counter like HomeGodDetailPanel's `eyeAnim.key`) collides across different
      // gods' simultaneously-mounted GodSvg instances, since @keyframes names are global: two
      // gods both on their first dock (id "eye-1") would fight over one keyframes rule, and
      // whichever rendered last "wins" for both, making an unrelated god's eyes show the wrong
      // color. idSalt (derived from instanceId, which every caller already sets to include the
      // god's own id) guarantees uniqueness the same way it already does for clipPath ids below.
      const animName = `eyeShift-${idSalt}${id}`
      const animStyle = `<style>@keyframes ${animName} { 0% { stroke: ${fromColor}; stroke-width: ${fromWeight * 2}; } 100% { stroke: ${toColor}; stroke-width: ${toWeight * 2}; } }</style>`
      const animCircles = circles.map((c) => {
        const uid = idSalt + c.cx.replace('.', '')
        return `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" clip-path="url(#ec-${uid})" style="stroke: ${fromColor}; stroke-width: ${fromWeight * 2}; animation: ${animName} ${duration}s ease ${delay}s forwards;"/>`
      }).join('\n')
      eyesGroup = `<defs>\n${defs}\n</defs>\n${animStyle}\n<g id="eyes">\n${animCircles}\n</g>`
    } else {
      const styledCircles = circles.map((c) => {
        const uid = idSalt + c.cx.replace('.', '')
        return `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${isSelected ? COLORS.white : 'none'}" stroke="${eye.color}" stroke-width="${eye.weight * 2}" clip-path="url(#ec-${uid})"/>`
      }).join('\n')
      const ringCircles = isSelected
        ? circles.map((c) => {
            const r = parseFloat(c.r)
            const count = 6
            const sw = 1
            const opacities = [0.40, 0.30, 0.21, 0.13, 0.07, 0.03]
            return Array.from({ length: count }, (_, i) => {
              const ri = r + sw * 0.5 + sw * i
              return `<circle cx="${c.cx}" cy="${c.cy}" r="${ri.toFixed(1)}" fill="none" stroke="${eye.color}" stroke-width="${sw}" opacity="${opacities[i]}"/>`
            }).join('\n')
          }).join('\n')
        : ''
      const glowAnimName = `eyeGlowPulse-${idSalt || 'g'}`
      const glowDefs = glow
        ? `<filter id="eyeGlowBlur-${idSalt}" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2"/></filter><style>@keyframes ${glowAnimName} { 0%, 100% { opacity: 0.12; } 50% { opacity: 0.4; } }</style>` +
          circles.map((c) => {
            const uid = idSalt + c.cx.replace('.', '')
            // Masks out the eye's own circle so the blurred glow is only visible outside it, not bleeding into the pupil.
            return `<mask id="eyeGlowMask-${uid}"><rect x="-1000" y="-1000" width="3000" height="3000" fill="white"/><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="black"/></mask>`
          }).join('\n')
        : ''
      const glowCircles = glow
        ? circles.map((c) => {
            const r = parseFloat(c.r)
            const uid = idSalt + c.cx.replace('.', '')
            return `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 1.6).toFixed(1)}" fill="${eye.color}" filter="url(#eyeGlowBlur-${idSalt})" mask="url(#eyeGlowMask-${uid})" style="animation: ${glowAnimName} 1.6s ease-in-out infinite;"/>`
          }).join('\n')
        : ''
      eyesGroup = `<defs>\n${defs}\n${glowDefs}\n</defs>${glowCircles ? `\n${glowCircles}` : ''}${ringCircles ? `\n${ringCircles}` : ''}\n<g id="eyes">\n${styledCircles}\n</g>`
    }

    } // end !filledEyes
  } else {
    // Path-based eyes: recolor fills and add stroke to vary thickness by anger level
    const recolored = eyesContent
      .replace(/fill="[^"]+"/g, `fill="${eye.color}"`)
      .replace(/<path /g, `<path stroke="${eye.color}" stroke-width="${eye.weight - 2}" stroke-linejoin="round" `)
    eyesGroup = `<g id="eyes">${recolored}</g>`
  }

  const svg = coloredBody
    .replace(/<g id="eyes">[\s\S]*?<\/g>/, '')
    .replace('</svg>', `${eyesGroup}${bodyAnimStyle}</svg>`)
    .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1 width="100%"')
    .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1 height="100%"')

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function eyeAnimationEqual(a?: EyeAnimation, b?: EyeAnimation): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.fromColor === b.fromColor && a.fromWeight === b.fromWeight && a.toColor === b.toColor
    && a.toWeight === b.toWeight && a.delay === b.delay && a.duration === b.duration && a.id === b.id
}

function bodyColorAnimationEqual(a?: BodyColorAnimation, b?: BodyColorAnimation): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return a.fromColor === b.fromColor && a.toColor === b.toColor && a.duration === b.duration && a.id === b.id
}

// dangerouslySetInnerHTML always replaces the DOM subtree wholesale, even when the generated
// markup string is byte-identical to last render — which restarts any embedded CSS @keyframes
// (the eye-color transition) from 0%. A parent re-render having nothing to do with this god (e.g.
// a sibling ritual card's hover state) would otherwise make the eyes visibly flash on every such
// re-render. `eyeAnimation` is passed as a fresh object literal each render, which would also
// defeat React.memo's default shallow comparison — compare its fields by value instead.
function godSvgPropsEqual(prev: GodSvgProps, next: GodSvgProps): boolean {
  return prev.svgRaw === next.svgRaw
    && prev.angerLevel === next.angerLevel
    && prev.isHovered === next.isHovered
    && prev.isSelected === next.isSelected
    && prev.filledEyes === next.filledEyes
    && prev.eyeGlow === next.eyeGlow
    && prev.bodyColor === next.bodyColor
    && prev.eyeColor === next.eyeColor
    && prev.hideEyes === next.hideEyes
    && prev.glow === next.glow
    && prev.instanceId === next.instanceId
    && eyeAnimationEqual(prev.eyeAnimation, next.eyeAnimation)
    && bodyColorAnimationEqual(prev.bodyColorAnimation, next.bodyColorAnimation)
}

export const GodSvg = memo(GodSvgImpl, godSvgPropsEqual)
