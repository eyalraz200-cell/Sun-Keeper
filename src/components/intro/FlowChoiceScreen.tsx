import type { CSSProperties } from 'react'
import { FONTS, COLORS } from '../../tokens'

interface FlowChoiceScreenProps {
  onFlow1: () => void
  onFlow2: () => void
}

// Dev-only pre-screen shown before MacDesktopIntro — picks which notification
// appears there (regular omens vs Tlaloc punishment).
export function FlowChoiceScreen({ onFlow1, onFlow2 }: FlowChoiceScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <button onClick={onFlow1} style={buttonStyle}>
        Flow 1 — Regular
      </button>
      <button onClick={onFlow2} style={buttonStyle}>
        Flow 2 — Tlaloc Punishment
      </button>
    </div>
  )
}

const buttonStyle: CSSProperties = {
  width: 280,
  padding: '16px 24px',
  borderRadius: 10,
  border: `1px solid ${COLORS.gray30}`,
  background: COLORS.cardBg,
  color: COLORS.white,
  fontFamily: FONTS.spectral,
  fontSize: 16,
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  cursor: 'pointer',
}
