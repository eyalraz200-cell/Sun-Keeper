import { COLORS, FONTS } from '../../tokens'
import { GODS } from '../../data/gods'
import { GodCard } from '../gods/GodCard'

const FESTIVAL_EVENTS = [
  { day: 1,  duration: 1, god: 'Tlaloc',          godId: 'tlaloc',          label: 'Festival day for' },
  { day: 4,  duration: 2, god: 'Chalchiuhtlicue',  godId: 'chalchiuhtlicue', label: 'Great vigil of' },
  { day: 7,  duration: 1, god: 'Ehecatl',          godId: 'ehecatl',         label: 'Sacred offering to' },
  { day: 9,  duration: 1, god: 'Tezcatlipoca',     godId: 'tezcatlipoca',    label: 'Night ceremony of' },
  { day: 13, duration: 3, god: 'Huitzilopochtli',  godId: 'huitzilopochtli', label: 'Grand feast of' },
  { day: 18, duration: 2, god: 'Mictlantecuhtli',  godId: 'mictlantecuhtli', label: 'Days of the dead, feast of' },
]

const ANGER_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }

function AngerCircle({ angerColor }: { angerColor: string }) {
  const weightMap: Record<string, number> = {
    '#c8322e': 6,
    '#d4662a': 4,
    '#c8a83c': 3,
  }
  const weight = weightMap[angerColor] ?? 2
  const color = weight === 2 ? '#ffffff' : angerColor
  return (
    <div style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      boxShadow: `inset 0 0 0 ${weight}px ${color}`,
      flexShrink: 0,
    }} />
  )
}

export function DashboardScreen() {
  const angriest = [...GODS]
    .sort((a, b) => ANGER_ORDER[a.angerLevel] - ANGER_ORDER[b.angerLevel])
    .slice(0, 4)

  const CARD: React.CSSProperties = {
    border: '1px solid #333333',
    borderRadius: '10px',
    padding: '24px',
    backgroundColor: COLORS.black,
    display: 'flex',
    flexDirection: 'column',
  }

  const SECTION_LABEL: React.CSSProperties = {
    margin: '0 0 16px',
    fontFamily: FONTS.spectral,
    fontSize: '11px',
    fontWeight: 300,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', backgroundColor: COLORS.black, overflow: 'hidden', height: '100%' }}>

      {/* Left/center area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', gap: '16px', padding: '24px 24px' }}>

        {/* Card: Angriest gods */}
        <div style={CARD}>
          <p style={SECTION_LABEL}>Gods Requiring Attention — {angriest.length}</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {angriest.map(god => (
              <div key={god.id} style={{ width: '160px', flexShrink: 0 }}>
                <GodCard god={god} isSelected={false} onClick={() => {}} />
              </div>
            ))}
          </div>
        </div>

        {/* Card: Calendar + Upcoming events */}
        <div style={{ ...CARD, flexDirection: 'row', gap: '32px', alignItems: 'center' }}>

          {/* Circle calendar */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={340} height={340}>
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20
                const x1 = 170 + 127 * Math.cos(angle)
                const y1 = 170 + 127 * Math.sin(angle)
                const x2 = 170 + 170 * Math.cos(angle)
                const y2 = 170 + 170 * Math.sin(angle)
                const midAngle = ((i + 0.5) / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20
                const tx = 170 + 149 * Math.cos(midAngle)
                const ty = 170 + 149 * Math.sin(midAngle)
                return (
                  <g key={i}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize={10} fontFamily="'Cinzel', serif">
                      {i + 1}
                    </text>
                  </g>
                )
              })}
              <circle cx={170} cy={170} r={170} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
              <circle cx={170} cy={170} r={127} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            </svg>
          </div>

          {/* Upcoming events */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={SECTION_LABEL}>Upcoming Events</p>
            {FESTIVAL_EVENTS.map(event => (
              <div
                key={event.day}
                style={{
                  backgroundColor: COLORS.black,
                  border: '1px solid #333333',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontFamily: FONTS.cinzel, fontSize: '11px', color: 'rgba(255,255,255,0.35)', minWidth: '52px' }}>
                  {event.duration > 1 ? `${event.day}–${event.day + event.duration - 1}` : `Day ${event.day}`}
                </span>
                <div style={{ width: '1px', height: '16px', backgroundColor: '#333333' }} />
                <span style={{ fontFamily: FONTS.spectral, fontSize: '12px', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>{event.label}</span>
                {(() => {
                  const god = GODS.find(g => g.id === event.godId)
                  return god ? <AngerCircle angerColor={god.angerColor} /> : null
                })()}
                <span style={{ fontFamily: FONTS.cinzel, fontSize: '11px', textTransform: 'uppercase', color: '#ffffff' }}>{event.god}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '331px', flexShrink: 0, borderLeft: '1px solid #333333', backgroundColor: COLORS.black }} />
    </div>
  )
}
