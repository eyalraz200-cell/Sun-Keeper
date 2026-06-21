import { useState } from 'react'
import { COLORS, FONTS } from '../../tokens'
import { GODS } from '../../data/gods'
import { PrisonerIcon } from '../icons/PrisonerIcon'
import { VolunteerIcon } from '../icons/VolunteerIcon'
import { ChildrenIcon } from '../icons/ChildrenIcon'
import { VirginIcon } from '../icons/VirginIcon'

const FESTIVAL_EVENTS = [
  { day: 1,  duration: 1, god: 'Tlaloc',          godId: 'tlaloc',          label: 'Festival day for' },
  { day: 4,  duration: 2, god: 'Chalchiuhtlicue',  godId: 'chalchiuhtlicue', label: 'Great vigil of' },
  { day: 7,  duration: 1, god: 'Ehecatl',          godId: 'ehecatl',         label: 'Sacred offering to' },
  { day: 9,  duration: 1, god: 'Tezcatlipoca',     godId: 'tezcatlipoca',    label: 'Night ceremony of' },
  { day: 13, duration: 3, god: 'Huitzilopochtli',  godId: 'huitzilopochtli', label: 'Grand feast of' },
  { day: 18, duration: 2, god: 'Mictlantecuhtli',  godId: 'mictlantecuhtli', label: 'Days of the dead, feast of' },
]

function outcomeLabel(color: string): string {
  if (color === '#c8322e') return 'Furious'
  if (color === '#d4662a') return 'Offended'
  if (color === '#d4a83c') return 'Uneasy'
  return 'Peaceful'
}

function outcomeEye(color: string): { color: string; weight: number } {
  if (color === '#c8322e') return { color: '#FF2435', weight: 6 }
  if (color === '#d4662a') return { color: '#EF7B2E', weight: 4 }
  if (color === '#d4a83c') return { color: '#D7C94E', weight: 3 }
  return { color: '#ffffff', weight: 2 }
}

function AngerCircle({ angerColor }: { angerColor: string }) {
  const weightMap: Record<string, number> = { '#c8322e': 6, '#d4662a': 4, '#c8a83c': 3 }
  const weight = weightMap[angerColor] ?? 2
  const color = weight === 2 ? '#ffffff' : angerColor
  return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', boxShadow: `inset 0 0 0 ${weight}px ${color}`, flexShrink: 0 }} />
  )
}

export function CalendarScreen() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const hoveredEvent = FESTIVAL_EVENTS.find(e => e.day === hoveredDay) ?? null
  const hoveredGod = hoveredEvent ? GODS.find(g => g.id === hoveredEvent.godId) ?? null : null

  const outcomeOrder = ['#c8322e', '#d4662a', '#d4a83c', '#c8a83c', '#ffffff']
  const bestRitual = hoveredGod
    ? [...hoveredGod.rituals].sort((a, b) => outcomeOrder.indexOf(b.outcomeColor) - outcomeOrder.indexOf(a.outcomeColor))[0]
    : null

  const totalParticipants = hoveredGod?.rituals.reduce(
    (acc, r) => ({
      prisoners:  acc.prisoners  + r.participants.prisoners,
      volunteers: acc.volunteers + r.participants.volunteers,
      children:   acc.children   + r.participants.children,
      virgins:    acc.virgins    + r.participants.virgins,
    }),
    { prisoners: 0, volunteers: 0, children: 0, virgins: 0 }
  ) ?? null

  const participantItems = [
    { key: 'prisoners'  as const, label: 'Prisoners',  icon: <PrisonerIcon  size={13} color="rgba(255,255,255,0.65)" /> },
    { key: 'volunteers' as const, label: 'Volunteers', icon: <VolunteerIcon size={13} color="rgba(255,255,255,0.65)" /> },
    { key: 'children'   as const, label: 'Children',   icon: <ChildrenIcon  size={13} color="rgba(255,255,255,0.65)" /> },
    { key: 'virgins'    as const, label: 'Virgins',    icon: <VirginIcon    size={13} color="rgba(255,255,255,0.65)" /> },
  ]

  const bestEye = bestRitual ? outcomeEye(bestRitual.outcomeColor) : null

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: COLORS.bgBase,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: '60px',
        minHeight: 0,
        overflow: 'hidden',
        gap: '48px',
      }}
    >
      <svg width={800} height={800} style={{ flexShrink: 0, alignSelf: 'center' }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20
          const x1 = 400 + 300 * Math.cos(angle)
          const y1 = 400 + 300 * Math.sin(angle)
          const x2 = 400 + 400 * Math.cos(angle)
          const y2 = 400 + 400 * Math.sin(angle)
          const midAngle = ((i + 0.5) / 20) * Math.PI * 2 - Math.PI / 2 - Math.PI / 20
          const tx = 400 + 350 * Math.cos(midAngle)
          const ty = 400 + 350 * Math.sin(midAngle)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth={1} />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize={12} fontFamily="'Cinzel', serif">
                {i + 1}
              </text>
            </g>
          )
        })}
        <circle cx={400} cy={400} r={400} fill="none" stroke="#ffffff" strokeWidth={1} />
        <circle cx={400} cy={400} r={300} fill="none" stroke="#ffffff" strokeWidth={1} />
      </svg>

      {/* Event list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
          maxHeight: '100%',
          paddingRight: '16px',
          paddingTop: '32px',
          paddingBottom: '32px',
          flexShrink: 0,
        }}
      >
        {FESTIVAL_EVENTS.map((event) => {
          const god = GODS.find(g => g.id === event.godId)
          const isHovered = hoveredDay === event.day
          return (
            <div
              key={event.day}
              onMouseEnter={() => setHoveredDay(event.day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                width: '280px',
                backgroundColor: '#181818',
                border: isHovered ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'default',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ padding: '20px 24px 16px' }}>
                <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.82)', display: 'block', marginBottom: '6px' }}>
                  {event.duration > 1 ? `Day ${event.day} – ${event.day + event.duration - 1}` : `Day ${event.day}`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{event.label}</span>
                  {god && <AngerCircle angerColor={god.angerColor} />}
                  <span style={{ fontFamily: FONTS.cinzel, textTransform: 'uppercase', fontSize: '11px', color: '#ffffff' }}>{event.god}</span>
                </div>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px 0' }} />
            </div>
          )
        })}
      </div>

      {/* Detail card — always present, content fades in on hover */}
      <div
        style={{
          alignSelf: 'center',
          width: '280px',
          flexShrink: 0,
          backgroundColor: '#181818',
          border: '2px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* God name + day */}
        <div style={{ padding: '20px 24px 16px', minHeight: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              opacity: hoveredEvent ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' }}>
              {hoveredEvent
                ? hoveredEvent.duration > 1
                  ? `Day ${hoveredEvent.day} – ${hoveredEvent.day + hoveredEvent.duration - 1}`
                  : `Day ${hoveredEvent.day}`
                : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hoveredGod && <AngerCircle angerColor={hoveredGod.angerColor} />}
              <span style={{ fontFamily: FONTS.cinzel, textTransform: 'uppercase', fontSize: '13px', fontWeight: 400, color: '#ffffff' }}>
                {hoveredEvent?.god ?? ''}
              </span>
            </div>
          </div>
          {!hoveredEvent && (
            <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.2)', position: 'absolute' }}>
              Hover an event
            </span>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Cost */}
        <div
          style={{
            padding: '16px 24px',
            opacity: hoveredEvent ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '10px' }}>
            Cost
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {participantItems.map(({ key, label, icon }) => {
              const count = totalParticipants?.[key] ?? 0
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: count > 0 ? 1 : 0.12 }}>
                  {icon}
                  <span style={{ flex: 1, fontFamily: FONTS.spectral, fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                  <span style={{ fontFamily: FONTS.spectral, fontSize: '13px', fontWeight: 300, color: '#ffffff' }}>
                    {count > 0 ? count : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 13px' }} />

        {/* Resulting anger state */}
        <div
          style={{
            padding: '16px 24px',
            opacity: hoveredEvent ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <span style={{ fontFamily: FONTS.spectral, fontWeight: 300, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '10px' }}>
            Best Resulting State
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bestEye && (
              <div style={{ width: 20, height: 20, borderRadius: '50%', boxShadow: `inset 0 0 0 ${bestEye.weight}px ${bestEye.color}`, flexShrink: 0 }} />
            )}
            <span style={{ fontFamily: FONTS.spectral, fontSize: '13px', fontWeight: 300, color: '#ffffff' }}>
              {bestRitual ? outcomeLabel(bestRitual.outcomeColor) : ''}
            </span>
          </div>
          {bestRitual && (
            <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.35)', display: 'block', marginTop: '4px' }}>
              via {bestRitual.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
