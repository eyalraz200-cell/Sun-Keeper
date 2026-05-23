import { COLORS, FONTS, LAYOUT } from '../tokens'
import { Link, Sock, SunDim, Sparkle } from '@phosphor-icons/react'

interface ResourceBarProps {
  prisoners: number
  children: number
  virgins: number
  volunteers: number
  dimmed?: boolean
}

export function ResourceBar({ prisoners, children, virgins, volunteers, dimmed = false }: ResourceBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: `${LAYOUT.bottomBarHeight}px`,
        backgroundColor: '#181818',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '24px',
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingBottom: '16px',
        fontFamily: FONTS.spectral,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <p style={{ margin: 0, fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
        Available Offerings
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '128px' }}>
        <ResourceItem icon={<Link    size={28} color="rgba(255,255,255,0.55)" />} label="Prisoners"  count={prisoners} />
        <ResourceItem icon={<Sock    size={28} color="rgba(255,255,255,0.55)" />} label="Children"   count={children} />
        <ResourceItem icon={<SunDim  size={28} color="rgba(255,255,255,0.55)" />} label="Virgins"    count={virgins} />
        <ResourceItem icon={<Sparkle size={28} color="rgba(255,255,255,0.55)" />} label="Volunteers" count={volunteers} />
      </div>
    </div>
  )
}

interface ResourceItemProps {
  icon: React.ReactNode
  label: string
  count: number
}

function ResourceItem({ icon, label, count }: ResourceItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#acacac',
            lineHeight: '1',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#ffffff',
            lineHeight: '1',
          }}
        >
          {count}
        </div>
      </div>
    </div>
  )
}
