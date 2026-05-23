import { FONTS } from '../tokens'

interface CtaButtonProps {
  label: string
  onClick: () => void
  active?: boolean
  visible?: boolean
}

export function CtaButton({ label, onClick, active = false, visible = true }: CtaButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!active}
      style={{
        padding: '0 32px',
        height: '44px',
        border: visible ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
        borderRadius: '8px',
        backgroundColor: active ? '#ffffff' : 'transparent',
        color: active ? '#000000' : '#ffffff',
        fontFamily: FONTS.spectral,
        fontWeight: 400,
        fontSize: '16px',
        textTransform: 'uppercase',
        cursor: active ? 'pointer' : 'not-allowed',
        opacity: visible ? (active ? 1 : 0.39) : 0.12,
      }}
    >
      {label}
    </button>
  )
}
