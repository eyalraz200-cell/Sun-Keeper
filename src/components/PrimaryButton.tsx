import { COLORS, FONTS } from '../tokens'

interface PrimaryButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function PrimaryButton({ label, onClick, disabled = false }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontFamily: FONTS.spectral,
        fontSize: '13px',
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        border: `1px solid ${disabled ? COLORS.textMuted : COLORS.textPrimary}`,
        backgroundColor: disabled ? 'transparent' : COLORS.bgCard,
        color: disabled ? COLORS.textMuted : COLORS.textPrimary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: '2px',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgHover
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.bgCard
        }
      }}
    >
      {label}
    </button>
  )
}
