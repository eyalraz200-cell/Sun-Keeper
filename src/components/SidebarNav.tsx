import { COLORS, LAYOUT } from '../tokens'

interface SidebarNavProps {
  onNavClick?: (section: string) => void
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const navItems = [
    { id: 'pantheon', icon: '☉' }, // Sun icon for pantheon
    { id: 'calendar', icon: '◐' }, // Moon icon
    { id: 'omens', icon: '※' }, // Star-like icon
    { id: 'history', icon: '↻' }, // Cycle icon
  ]

  return (
    <div
      style={{
        width: `${LAYOUT.navWidth}px`,
        height: `calc(100vh - ${LAYOUT.bottomBarHeight}px)`,
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #545454`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        gap: '16px',
      }}
    >
      {navItems.map((item, idx) => (
        <button
          key={item.id}
          onClick={() => onNavClick?.(item.id)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '2px',
            backgroundColor: idx === 0 ? COLORS.bgCard : 'transparent',
            border: idx === 0 ? `1px solid ${COLORS.border}` : 'none',
            color: COLORS.textPrimary,
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
          }}
          onMouseLeave={(e) => {
            if (idx === 0) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgCard
            } else {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
