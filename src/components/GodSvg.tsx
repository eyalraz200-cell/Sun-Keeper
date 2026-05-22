import type { AngerLevel } from '../data/gods'

const EYE_STYLES: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}

const SELECTED_EYE_OVERRIDES: Partial<Record<AngerLevel, string>> = {
  medium: '#FF7913',
  low:    '#E7C104',
  none:   '#000000',
}

export interface GodSvgProps {
  svgRaw: string
  angerLevel: AngerLevel
  isHovered?: boolean
  isSelected?: boolean
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

export function GodSvg({ svgRaw, angerLevel, isHovered = false, isSelected = false }: GodSvgProps) {
  const baseEye = EYE_STYLES[angerLevel]
  const eye = isSelected
    ? { color: SELECTED_EYE_OVERRIDES[angerLevel] ?? baseEye.color, weight: baseEye.weight }
    : isHovered && angerLevel === 'none'
    ? { color: '#ffffff', weight: 2 }
    : baseEye

  const bodySvg = svgRaw
    .replace(/fill="black"/g, 'fill="#6C6C6C"')
    .replace(/fill="#[Ff][Ee][Ff][Ee][Ff][Ee]"/g, 'fill="#6C6C6C"')
  const bodyColor = isSelected ? '#000000' : isHovered ? '#ffffff' : '#6C6C6C'
  const coloredBody = bodySvg.replace(/fill="#6C6C6C"/g, `fill="${bodyColor}"`)

  const eyesMatch = coloredBody.match(/<g id="eyes">([\s\S]*?)<\/g>/)
  const eyesContent = eyesMatch?.[1] ?? ''

  let eyesGroup: string

  if (/<circle/.test(eyesContent)) {
    // Circle-based eyes: replace with inside-stroke technique
    const circles = parseCircles(eyesContent)
    const defs = circles.map((c) => {
      const uid = c.cx.replace('.', '')
      return `<clipPath id="ec-${uid}"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/></clipPath>`
    }).join('\n')
    const styledCircles = circles.map((c) => {
      const uid = c.cx.replace('.', '')
      return `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="none" stroke="${eye.color}" stroke-width="${eye.weight * 2}" clip-path="url(#ec-${uid})"/>`
    }).join('\n')
    eyesGroup = `<defs>\n${defs}\n</defs>\n<g id="eyes">\n${styledCircles}\n</g>`
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
