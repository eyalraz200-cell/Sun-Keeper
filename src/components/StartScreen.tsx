import { GodSvg } from './GodSvg'
import { FONTS } from '../tokens'
import { GODS } from '../data/gods'
import type { AngerLevel } from '../data/gods'
import { GOD_SVG_MAP } from './GodCard'

interface StartScreenProps {
  dismissing: boolean
  onClick: () => void
}

const ROW_TOP = ['calc(50% - 190px)', 'calc(50% + 90px)']

const TEXT_DELAY = 4.2

const END_EYE: Record<string, { color: string; weight: number }> = {
  Furious: { color: '#FF2435', weight: 6 },
  Angry:   { color: '#EF7B2E', weight: 4 },
  Uneasy:  { color: '#D7C94E', weight: 3 },
}

const EYE_FROM: Record<AngerLevel, { color: string; weight: number }> = {
  high:   { color: '#FF2435', weight: 6 },
  medium: { color: '#EF7B2E', weight: 4 },
  low:    { color: '#D7C94E', weight: 3 },
  none:   { color: '#6C6C6C', weight: 2 },
}

const END_LABEL: Record<AngerLevel, string> = {
  high:   'Furious',
  medium: 'Angry',
  low:    'Uneasy',
  none:   'Uneasy',
}

const ANGER_ORDER: Record<AngerLevel, number> = { high: 0, medium: 1, low: 2, none: 3 }

function rowOffsets(count: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.round((i - (count - 1) / 2) * 220))
}

const sortedGods = [...GODS].sort((a, b) => ANGER_ORDER[a.angerLevel] - ANGER_ORDER[b.angerLevel])
const row0 = sortedGods.slice(0, Math.ceil(sortedGods.length / 2))
const row1 = sortedGods.slice(Math.ceil(sortedGods.length / 2))

const godSlots = [
  ...row0.map((god, col) => ({ god, row: 0, col })),
  ...row1.map((god, col) => ({ god, row: 1, col })),
]

export function StartScreen({ dismissing, onClick }: StartScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#181818',
        zIndex: 2000,
        overflow: 'hidden',
        animation: dismissing ? 'fadeFromBlack 0.6s ease forwards' : undefined,
      }}
    >
      <style>{`
        @keyframes startTextFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .start-cta-btn {
          background-color: transparent;
          color: #ffffff;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .start-cta-btn:hover {
          background-color: #ffffff;
          color: #181818;
        }
      `}</style>

      <div style={{
        position: 'absolute',
        top: '6vh',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: FONTS.cinzel,
        fontSize: '20px',
        fontWeight: 400,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.7)',
        whiteSpace: 'nowrap',
      }}>
        Gods Anger Status
      </div>

      {godSlots.map(({ god, row, col }, i) => {
        const svg = GOD_SVG_MAP[god.id]
        if (!svg) return null
        const from = EYE_FROM[god.angerLevel]
        const endLabel = END_LABEL[god.angerLevel]
        const offsets = rowOffsets(row === 0 ? row0.length : row1.length)
        return (
          <div
            key={god.id}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offsets[col]}px)`,
              top: ROW_TOP[row],
              transform: 'translate(-50%, -50%)',
              width: '125px',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '125px', height: '194px', flexShrink: 0 }}>
              <GodSvg
                svgRaw={svg}
                angerLevel={god.angerLevel}
                eyeAnimation={{
                  fromColor: from.color,
                  fromWeight: from.weight,
                  toColor: END_EYE[endLabel].color,
                  toWeight: END_EYE[endLabel].weight,
                  delay: 2,
                  duration: 2,
                  id: `g${i}`,
                }}
              />
            </div>
            <div style={{
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{ fontFamily: FONTS.cinzel, fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{god.name}</span>
              <div style={{ opacity: 0, animation: `startTextFadeIn 0.6s ease ${TEXT_DELAY}s forwards` }}>
                <div style={{
                  fontFamily: FONTS.spectral,
                  fontSize: '14px',
                  fontWeight: 300,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                    <defs>
                      <clipPath id={`ic-${i}`}><circle cx="10" cy="10" r="9"/></clipPath>
                    </defs>
                    <circle cx="10" cy="10" r="9" fill="none"
                      stroke={END_EYE[endLabel].color}
                      strokeWidth={END_EYE[endLabel].weight * 2}
                      clipPath={`url(#ic-${i})`}/>
                  </svg>
                  {endLabel}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <button
        onClick={onClick}
        className="start-cta-btn"
        style={{
          position: 'absolute',
          bottom: '10vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: FONTS.spectral,
          fontSize: '16px',
          fontWeight: 400,
          letterSpacing: '1.5px',
          border: '1px solid #ffffff',
          borderRadius: '6px',
          padding: '10px 36px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          opacity: 0,
          animation: `startTextFadeIn 0.6s ease ${TEXT_DELAY}s forwards`,
        }}
      >
        CONTINUE
      </button>
    </div>
  )
}
