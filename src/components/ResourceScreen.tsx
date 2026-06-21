import { FONTS } from '../tokens'
import { PrisonerIcon } from './PrisonerIcon'
import { VolunteerIcon } from './VolunteerIcon'
import { ChildrenIcon } from './ChildrenIcon'
import { VirginIcon } from './VirginIcon'

interface ResourceScreenProps {
  prisoners: number
  volunteers: number
  children: number
  virgins: number
  temples?: number
  templesTotal?: number
  grandTemples?: number
  grandTemplesTotal?: number
}

const CARD_STYLE: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.2)',
  width: '315px',
  minHeight: '329px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 17px',
  gap: '0',
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONTS.spectral,
  fontSize: '16px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '1px',
  lineHeight: '18px',
}

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: FONTS.spectral,
  fontSize: '16px',
  fontWeight: 400,
  color: '#ffffff',
  letterSpacing: '1px',
  lineHeight: '18px',
}

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '10px',
  paddingBottom: '10px',
}

const DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  margin: '0 -17px',
}

function VictimCard({
  label,
  icon,
  count,
  reserved,
  events,
}: {
  label: string
  icon: React.ReactNode
  count: number
  reserved: number
  events: { name: string; count: number }[]
}) {
  return (
    <div style={CARD_STYLE}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', paddingBottom: '16px' }}>
        {icon}
        <span style={{ ...VALUE_STYLE, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Cinzel', serif" }}>{label}</span>
      </div>
      <div style={DIVIDER_STYLE} />

      {/* Available */}
      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>Available</span>
        <span style={VALUE_STYLE}>{count.toLocaleString()}</span>
      </div>
      <div style={DIVIDER_STYLE} />

      {/* Reserved */}
      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>Reserved</span>
        <span style={VALUE_STYLE}>{reserved.toLocaleString()}</span>
      </div>

      {/* Events */}
      {events.map(event => (
        <div key={event.name} style={{ ...ROW_STYLE, paddingTop: '6px', paddingBottom: '6px' }}>
          <span style={{ ...LABEL_STYLE, fontSize: '13px', color: 'rgba(255,255,255,0.3)', paddingLeft: '12px' }}>{event.name}</span>
          <span style={{ ...VALUE_STYLE, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{event.count}</span>
        </div>
      ))}

      {/* Spacer + button */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button style={{
          fontFamily: FONTS.spectral,
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '1px',
          padding: '8px 28px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
        }}>
          order more
        </button>
      </div>
    </div>
  )
}

function TempleCard({
  label,
  available,
  total,
  ceremonies,
}: {
  label: string
  available: number
  total: number
  ceremonies: { label: string; daysLeft: number; count: number }[]
}) {
  return (
    <div style={{ ...CARD_STYLE, width: undefined, flex: 1 }}>
      {/* Header */}
      <div style={{ paddingBottom: '16px' }}>
        <span style={{ ...VALUE_STYLE, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Cinzel', serif" }}>{label}</span>
      </div>
      <div style={DIVIDER_STYLE} />

      {/* Available */}
      <div style={ROW_STYLE}>
        <span style={LABEL_STYLE}>Available</span>
        <span style={VALUE_STYLE}>{available}/{total}</span>
      </div>
      <div style={DIVIDER_STYLE} />

      {/* Occupied */}
      {ceremonies.length > 0 && (
        <>
          <div style={{ paddingTop: '12px', paddingBottom: '8px' }}>
            <span style={{ ...LABEL_STYLE, fontSize: '13px' }}>Occupied — ceremonies in progress</span>
          </div>
          {ceremonies.map((c, i) => (
            <div key={i} style={{ ...ROW_STYLE, paddingTop: '6px', paddingBottom: '6px' }}>
              <span style={{ ...LABEL_STYLE, fontSize: '13px', paddingLeft: '12px' }}>{c.daysLeft} day{c.daysLeft !== 1 ? 's' : ''} left</span>
              <span style={{ ...VALUE_STYLE, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>+{c.count}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export function ResourceScreen({
  prisoners,
  volunteers,
  children,
  virgins,
  temples = 17,
  templesTotal = 25,
  grandTemples = 2,
  grandTemplesTotal = 3,
}: ResourceScreenProps) {
  const victimCards = [
    {
      label: 'Prisoners',
      icon: <PrisonerIcon size={18} color="rgba(255,255,255,0.5)" />,
      count: prisoners,
      reserved: 70,
      events: [{ name: 'War Ritual', count: 30 }, { name: 'Tlaloc Feast', count: 40 }],
    },
    {
      label: 'Volunteers',
      icon: <VolunteerIcon size={18} color="rgba(255,255,255,0.5)" />,
      count: volunteers,
      reserved: 120,
      events: [{ name: 'Sun March', count: 80 }, { name: 'Moon Rite', count: 40 }],
    },
    {
      label: 'Children',
      icon: <ChildrenIcon size={18} color="rgba(255,255,255,0.5)" />,
      count: children,
      reserved: 40,
      events: [{ name: 'Rain Offering', count: 40 }],
    },
    {
      label: 'Virgins',
      icon: <VirginIcon size={18} color="rgba(255,255,255,0.5)" />,
      count: virgins,
      reserved: 3,
      events: [{ name: 'Star Ceremony', count: 3 }],
    },
  ]

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#181818',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 32px',
      gap: '24px',
      overflowY: 'auto',
    }}>
      {/* Section label */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
      }}>
        Sacrificial Resources
      </div>

      {/* Top row: victim cards */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {victimCards.map(card => (
          <VictimCard key={card.label} {...card} />
        ))}
      </div>

      {/* Section label */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        marginTop: '8px',
      }}>
        Sacred Sites
      </div>

      {/* Bottom row: temple cards */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <TempleCard
          label="Temple"
          available={temples}
          total={templesTotal}
          ceremonies={[
            { label: 'Huitzilopochtli', daysLeft: 2, count: 3 },
            { label: 'Tlaloc', daysLeft: 5, count: 1 },
          ]}
        />
        <TempleCard
          label="Grand Temple"
          available={grandTemples}
          total={grandTemplesTotal}
          ceremonies={[]}
        />
      </div>
    </div>
  )
}
