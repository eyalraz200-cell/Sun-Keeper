import { useState } from 'react'
import { GODS, type God, type Ritual } from '../../data/gods'

const CARD_WIDTH = 255
const CARD_HEIGHT = 248
const DIVIDER_X = 168

const OUTCOME_LABEL: Record<string, string> = {
  '#c8322e': 'Furious',
  '#d4662a': 'Offended',
  '#d4a83c': 'Uneasy',
  '#c8a83c': 'Peaceful',
}

const WIRE_FONT = 'system-ui, sans-serif'
const WIREFRAME_GOD_COUNT = 24
const WIREFRAME_GODS = Array.from({ length: WIREFRAME_GOD_COUNT }, (_, i) => ({
  ...GODS[i % GODS.length],
  id: `${GODS[i % GODS.length].id}-wire-${i}`,
}))

function WireResourceItem({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '28px', height: '28px', flexShrink: 0, border: '1px solid #666666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666666' }}>icon</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: WIRE_FONT, fontSize: '13px', color: '#999999' }}>{label}</span>
        <span style={{ fontFamily: WIRE_FONT, fontSize: '14px', color: '#ffffff' }}>{count}</span>
      </div>
    </div>
  )
}

function WireSiteItem({ label, available, total }: { label: string; available: number; total: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontFamily: WIRE_FONT, fontSize: '13px', color: '#999999' }}>{label}</span>
      <span style={{ fontFamily: WIRE_FONT, fontSize: '14px', color: '#ffffff' }}>{available}/{total} available</span>
    </div>
  )
}

function WireResourceBar({ prisoners, volunteers, children, virgins, temples = 14, templesTotal = 25, greatTemples = 2, greatTemplesTotal = 3 }: { prisoners: number; volunteers: number; children: number; virgins: number; temples?: number; templesTotal?: number; greatTemples?: number; greatTemplesTotal?: number }) {
  return (
    <div style={{ flexShrink: 0, height: '88px', backgroundColor: '#181818', borderBottom: '1px dashed #666666', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '48px' }}>
      <WireResourceItem label="Prisoners" count={prisoners} />
      <WireResourceItem label="Children" count={children} />
      <WireResourceItem label="Virgins" count={virgins} />
      <WireResourceItem label="Volunteers" count={volunteers} />
      <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(102,102,102,0.4)' }} />
      <WireSiteItem label="Temple" available={temples} total={templesTotal} />
      <WireSiteItem label="Grand Temple" available={greatTemples} total={greatTemplesTotal} />
    </div>
  )
}

function WireSmileyFace({ size = 64 }: { size?: number }) {
  const s = size / 64
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" stroke="#666666" strokeWidth={1.5 / s} strokeDasharray={`${3 / s} ${3 / s}`} />
      <circle cx="22" cy="26" r="4" stroke="#999999" strokeWidth={1.5 / s} />
      <circle cx="42" cy="26" r="4" stroke="#999999" strokeWidth={1.5 / s} />
      <path d="M20 40 Q32 50 44 40" stroke="#666666" strokeWidth={1.5 / s} fill="none" strokeLinecap="round" />
    </svg>
  )
}

function WireGodCard({ god, onClick, isSelected }: { god: God; onClick?: () => void; isSelected?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        position: 'relative',
        backgroundColor: '#181818',
        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(102,102,102,0.4)'}`,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '6px',
          width: '161px',
          textAlign: 'center',
          fontFamily: WIRE_FONT,
          fontSize: '12px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {god.name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '25px',
          top: '38px',
          width: '125px',
          height: '194px',
          border: '1px dashed #666666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WireSmileyFace />
      </div>
      <div style={{ position: 'absolute', left: `${DIVIDER_X}px`, top: '12px', width: '1px', height: '225px', backgroundColor: 'rgba(102,102,102,0.4)' }} />
      <div
        style={{
          position: 'absolute',
          left: `${DIVIDER_X + 18}px`,
          right: '12px',
          top: '38px',
          textAlign: 'center',
          fontFamily: WIRE_FONT,
          fontSize: '12px',
          color: '#999999',
        }}
      >
        No Ritual Selected
      </div>
    </div>
  )
}

function WireRitualCard({ ritual }: { ritual: Ritual }) {
  const { prisoners, volunteers, children, virgins } = ritual.participants
  const rows: Array<[string, number]> = [
    ['Prisoners', prisoners],
    ['Volunteers', volunteers],
    ['Children', children],
    ['Virgins', virgins],
  ]
  const divider = <div style={{ height: '1px', backgroundColor: 'rgba(102,102,102,0.4)', margin: '12px 0' }} />
  return (
    <div style={{ width: '223px', flexShrink: 0, border: '1px solid rgba(102,102,102,0.4)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', fontFamily: WIRE_FONT }}>
      <div style={{ fontSize: '16px', color: '#ffffff', textAlign: 'center' }}>{ritual.name}</div>
      <div style={{ fontSize: '12px', color: '#999999', textAlign: 'center', marginTop: '8px' }}>{ritual.description}</div>
      {divider}
      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px' }}>Blood Price</div>
      {rows.map(([label, count]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: count > 0 ? '#ffffff' : '#555555', marginBottom: '4px' }}>
          <span>{label}</span>
          <span>{count > 0 ? count : '—'}</span>
        </div>
      ))}
      {divider}
      <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px' }}>Sacred Site</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ffffff', marginBottom: '4px' }}>
        <span>{ritual.sacredSite.name}</span>
        <span>{ritual.sacredSite.count}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ffffff' }}>
        <span>Duration</span>
        <span>{ritual.duration}</span>
      </div>
      {divider}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
        <div style={{ fontSize: '12px', color: '#999999' }}>Resulting State</div>
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #999999' }} />
        <div style={{ fontSize: '13px', color: '#ffffff' }}>{OUTCOME_LABEL[ritual.outcomeColor] ?? 'Peaceful'}</div>
      </div>
    </div>
  )
}

function WireGodDetailPanel({ god, onBack }: { god: God; onBack: () => void }) {
  return (
    <div style={{ flexShrink: 0, margin: '24px 24px 0', padding: '24px', border: '1px solid rgba(102,102,102,0.4)', borderRadius: '12px', fontFamily: WIRE_FONT }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>· {god.name} ·</div>
      </div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flexShrink: 0, width: '252px', height: '392px', border: '1px dashed #666666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WireSmileyFace size={160} />
        </div>
        <div style={{ flexShrink: 0, width: '1px', backgroundColor: 'rgba(102,102,102,0.4)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#999999', cursor: 'pointer', marginBottom: '16px' }}>
            <span>‹</span>
            <span>Choose ritual</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '20px' }}>
            {god.rituals.slice(0, 3).map(ritual => (
              <WireRitualCard key={ritual.id} ritual={ritual} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NewScreenProps {
  prisoners: number
  volunteers: number
  children: number
  virgins: number
  aiPanelOpen?: boolean
}

export function NewScreen({ prisoners, volunteers, children, virgins, aiPanelOpen = false }: NewScreenProps) {
  const [selectedGodId, setSelectedGodId] = useState<string | null>(null)
  const selectedGod = WIREFRAME_GODS.find(god => god.id === selectedGodId) ?? null

  const handleCardClick = (godId: string) => {
    setSelectedGodId(prev => (prev === godId ? null : godId))
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#181818' }}>
      <WireResourceBar prisoners={prisoners} volunteers={volunteers} children={children} virgins={virgins} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto',
          marginRight: aiPanelOpen ? '331px' : 0,
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {selectedGod ? (
          <WireGodDetailPanel god={selectedGod} onBack={() => setSelectedGodId(null)} />
        ) : (
          <div style={{ flexShrink: 0, padding: '24px 24px 0', textAlign: 'left' }}>
            <div style={{ fontFamily: WIRE_FONT, fontSize: '20px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gods</div>
            <div style={{ fontFamily: WIRE_FONT, fontSize: '13px', color: '#999999', marginTop: '4px' }}>sorted by anger level</div>
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, ${CARD_WIDTH}px)`,
            justifyContent: 'space-between',
            gap: '24px',
            padding: '24px',
            opacity: selectedGod ? 0.35 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {WIREFRAME_GODS.map(god => (
            <WireGodCard key={god.id} god={god} isSelected={god.id === selectedGodId} onClick={() => handleCardClick(god.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
