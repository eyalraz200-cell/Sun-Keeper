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

export interface GodSvgProps {
  svgRaw: string
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
  eyeAnimation?: EyeAnimation
  filledEyes?: boolean
  eyeGlow?: boolean
  bodyColor?: string
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

export function GodSvg({ svgRaw, angerLevel, isHovered = false, isSelected = false, eyeAnimation, filledEyes = false, eyeGlow = false, bodyColor: bodyColorOverride, hideEyes = false, glow = false, instanceId = '' }: GodSvgProps) {
  const idSalt = instanceId ? `${instanceId.replace(/[^a-zA-Z0-9-]/g, '')}-` : ''
  const baseEye = EYE_STYLES[angerLevel]
  const eye = isSelected
    ? { color: SELECTED_EYE_OVERRIDES[angerLevel] ?? baseEye.color, weight: baseEye.weight }
    : isHovered && angerLevel === 'none'
    ? { color: COLORS.gray95, weight: 2 }
    : baseEye

  const bodySvg = svgRaw
    .replace(/fill="black"/g, `fill="${COLORS.gray40}"`)
    .replace(/fill="white"/g, `fill="${COLORS.gray40}"`)
    .replace(/fill="#[Ff][Ee][Ff][Ee][Ff][Ee]"/g, `fill="${COLORS.gray40}"`)
  const bodyColor = bodyColorOverride ?? (isSelected ? COLORS.gray0 : isHovered ? COLORS.gray95 : COLORS.gray40)
  const coloredBody = bodySvg.replace(new RegExp(`fill="${COLORS.gray40}"`, 'g'), `fill="${bodyColor}"`)

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
      const { fromColor, fromWeight, toColor, toWeight, delay = 0.8, duration = 2, id = 'ritual' } = eyeAnimation
      const animName = `eyeShift-${id}`
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
        ? `<filter id="eyeGlowBlur-${idSalt}" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter><style>@keyframes ${glowAnimName} { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }</style>`
        : ''
      const glowCircles = glow
        ? circles.map((c) => {
            const r = parseFloat(c.r)
            return `<circle cx="${c.cx}" cy="${c.cy}" r="${(r * 1.4).toFixed(1)}" fill="${eye.color}" filter="url(#eyeGlowBlur-${idSalt})" style="animation: ${glowAnimName} 1.6s ease-in-out infinite;"/>`
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
    .replace('</svg>', `${eyesGroup}</svg>`)
    .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1 width="100%"')
    .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1 height="100%"')

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
