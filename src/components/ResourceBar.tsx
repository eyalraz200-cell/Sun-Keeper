import { COLORS, FONTS, LAYOUT } from '../tokens'
import { Link, Sock, SunDim, Sparkle } from '@phosphor-icons/react'

interface ResourceBarProps {
  prisoners: number
  children: number
  virgins: number
  volunteers: number
}

export function ResourceBar({ prisoners, children, virgins, volunteers }: ResourceBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: `${LAYOUT.bottomBarHeight}px`,
        borderTop: `1px solid #333333`,
        backgroundColor: COLORS.bgCard,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '32px',
        paddingRight: '32px',
        gap: '32px',
        fontFamily: FONTS.spectral,
      }}
    >
      <ResourceItem icon={<Link size={32} color="white" weight="fill" />} label="Prisoners" count={prisoners} />
      <ResourceItem icon={<Sock size={32} color="white" weight="fill" />} label="Children" count={children} />
      <ResourceItem icon={<SunDim size={32} color="white" weight="fill" />} label="Virgins" count={virgins} />
      <ResourceItem icon={<Sparkle size={32} color="white" weight="fill" />} label="Volunteers" count={volunteers} />
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
      <div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#acacac',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: '#ffffff',
          }}
        >
          {count}
        </div>
      </div>
    </div>
  )
}
