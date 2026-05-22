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
        borderTop: `1px solid #333333`,
        backgroundColor: '#181818',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '32px',
        paddingRight: '32px',
        gap: '128px',
        fontFamily: FONTS.spectral,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <ResourceItem icon={<Link size={28} color="white" />} label="Prisoners" count={prisoners} />
      <ResourceItem icon={<Sock size={28} color="white" />} label="Children" count={children} />
      <ResourceItem icon={<SunDim size={28} color="white" />} label="Virgins" count={virgins} />
      <ResourceItem icon={<Sparkle size={28} color="white" />} label="Volunteers" count={volunteers} />
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
        gap: '17px',
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
