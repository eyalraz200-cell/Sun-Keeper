import { COLORS, FONTS, LAYOUT } from '../tokens'

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
        height: `${LAYOUT.bottomBarHeight}px`,
        borderTop: `1px solid #545454`,
        backgroundColor: COLORS.bgCard,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${LAYOUT.navWidth + LAYOUT.sidebarWidth}px`,
        paddingRight: '16px',
        gap: '32px',
        fontFamily: FONTS.spectral,
      }}
    >
      <ResourceItem label="Prisoners" count={prisoners} />
      <ResourceItem label="Children" count={children} />
      <ResourceItem label="Virgins" count={virgins} />
      <ResourceItem label="Volunteers" count={volunteers} />
    </div>
  )
}

interface ResourceItemProps {
  label: string
  count: number
}

function ResourceItem({ label, count }: ResourceItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: COLORS.textSecondary,
          borderRadius: '50%',
          opacity: 0.5,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: 400,
            color: COLORS.textPrimary,
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
            color: COLORS.textPrimary,
          }}
        >
          {count}
        </div>
      </div>
    </div>
  )
}
