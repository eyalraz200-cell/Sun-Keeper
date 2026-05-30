import { GodSvg } from './GodSvg'
import { FONTS } from '../tokens'
import tlalocRaw from '../assets/Gods/Tlaloc.svg?raw'
import quetzalcoatlRaw from '../assets/Gods/Quetzalcoatl.svg?raw'
import huitzilopochtliRaw from '../assets/Gods/huitzilopochtli.svg?raw'
import mictlantecuhtliRaw from '../assets/Gods/Mictlantecuhtli.svg?raw'

interface StartScreenProps {
  dismissing: boolean
  onClick: () => void
}

const ROW_OFFSETS = [[-440, -220, 0, 220, 440], [-330, -110, 110, 330]]
const ROW_TOP = ['calc(50% - 190px)', 'calc(50% + 90px)']

// Animation ends at delay(1) + duration(2) = 3s; text fades in at 3.2s
const TEXT_DELAY = 4.2

const END_EYE: Record<string, { color: string; weight: number }> = {
  Furious: { color: '#FF2435', weight: 6 },
  Angry:   { color: '#EF7B2E', weight: 4 },
  Uneasy:  { color: '#D7C94E', weight: 3 },
}

// Reading-order gradient: top-left (most angry) → top-right → bottom-left → bottom-right (least angry)
// End states: Furious×3, Angry×4, Uneasy×3
const GODS = [
  // Row 0 (5 gods): Furious, Furious, Furious, Angry, Angry
  { svg: tlalocRaw,          name: 'Tlaloc',          row: 0, col: 0, angerLevel: 'none'   as const, endLabel: 'Furious', eyeAnimation: { fromColor: '#6C6C6C', fromWeight: 2, toColor: '#FF2435', toWeight: 6, delay: 2, duration: 2, id: 'g0' } },
  { svg: mictlantecuhtliRaw, name: 'Mictlantecuhtli', row: 0, col: 1, angerLevel: 'low'    as const, endLabel: 'Furious', eyeAnimation: { fromColor: '#D7C94E', fromWeight: 3, toColor: '#FF2435', toWeight: 6, delay: 2, duration: 2, id: 'g1' } },
  { svg: quetzalcoatlRaw,    name: 'Quetzalcoatl',    row: 0, col: 2, angerLevel: 'medium' as const, endLabel: 'Furious', eyeAnimation: { fromColor: '#EF7B2E', fromWeight: 4, toColor: '#FF2435', toWeight: 6, delay: 2, duration: 2, id: 'g2' } },
  { svg: huitzilopochtliRaw,    name: 'Tezcatlipoca',    row: 0, col: 3, angerLevel: 'none'   as const, endLabel: 'Angry',   eyeAnimation: { fromColor: '#6C6C6C', fromWeight: 2, toColor: '#EF7B2E', toWeight: 4, delay: 2, duration: 2, id: 'g3' } },
  { svg: huitzilopochtliRaw, name: 'Huitzilopochtli', row: 0, col: 4, angerLevel: 'low'    as const, endLabel: 'Angry',   eyeAnimation: { fromColor: '#D7C94E', fromWeight: 3, toColor: '#EF7B2E', toWeight: 4, delay: 2, duration: 2, id: 'g4' } },
  // Row 1 (4 gods): Angry, Angry, Uneasy, Uneasy
  { svg: quetzalcoatlRaw,    name: 'Quetzalcoatl',    row: 1, col: 0, angerLevel: 'none'   as const, endLabel: 'Angry',   eyeAnimation: { fromColor: '#6C6C6C', fromWeight: 2, toColor: '#EF7B2E', toWeight: 4, delay: 2, duration: 2, id: 'g5' } },
  { svg: tlalocRaw,          name: 'Tlaloc',          row: 1, col: 1, angerLevel: 'low'    as const, endLabel: 'Angry',   eyeAnimation: { fromColor: '#D7C94E', fromWeight: 3, toColor: '#EF7B2E', toWeight: 4, delay: 2, duration: 2, id: 'g6' } },
  { svg: mictlantecuhtliRaw, name: 'Mictlantecuhtli', row: 1, col: 2, angerLevel: 'none'   as const, endLabel: 'Uneasy',  eyeAnimation: { fromColor: '#6C6C6C', fromWeight: 2, toColor: '#D7C94E', toWeight: 3, delay: 2, duration: 2, id: 'g7' } },
  { svg: huitzilopochtliRaw,    name: 'Tezcatlipoca',    row: 1, col: 3, angerLevel: 'none'   as const, endLabel: 'Uneasy',  eyeAnimation: { fromColor: '#6C6C6C', fromWeight: 2, toColor: '#D7C94E', toWeight: 3, delay: 2, duration: 2, id: 'g8' } },
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

      {GODS.map((god, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${ROW_OFFSETS[god.row][god.col]}px)`,
            top: ROW_TOP[god.row],
            transform: 'translate(-50%, -50%)',
            width: '125px',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '125px', height: '194px', flexShrink: 0 }}>
            <GodSvg svgRaw={god.svg} angerLevel={god.angerLevel} eyeAnimation={god.eyeAnimation} />
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
                    stroke={END_EYE[god.endLabel].color}
                    strokeWidth={END_EYE[god.endLabel].weight * 2}
                    clipPath={`url(#ic-${i})`}/>
                </svg>
                {god.endLabel}
              </div>
            </div>
          </div>
        </div>
      ))}
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
