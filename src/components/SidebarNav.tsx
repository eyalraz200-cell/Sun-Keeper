import { COLORS, LAYOUT } from '../tokens'
import { House, Calendar, Sparkle, Clock } from '@phosphor-icons/react'

interface SidebarNavProps {
  onNavClick?: (section: string) => void
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const navItems = [
    { id: 'pantheon', icon: House },
    { id: 'calendar', icon: Calendar },
    { id: 'omens', icon: Sparkle },
    { id: 'history', icon: Clock },
  ]

  return (
    <div
      style={{
        width: `${LAYOUT.navWidth}px`,
        height: '100vh',
        backgroundColor: COLORS.bgBase,
        borderRight: `1px solid #545454`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        gap: '16px',
      }}
    >
      {navItems.map((item, idx) => {
        const IconComponent = item.icon
        return (
          <button
            key={item.id}
            onClick={() => onNavClick?.(item.id)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              backgroundColor: idx === 0 ? COLORS.bgCard : 'transparent',
              border: idx === 0 ? `1px solid #545454` : 'none',
              color: COLORS.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
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
            <IconComponent size={24} color={COLORS.textPrimary} weight="regular" />
          </button>
        )
      })}
    </div>
  )
}
