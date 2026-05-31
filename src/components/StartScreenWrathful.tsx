import { useState } from 'react'
import { GodSvg } from './GodSvg'
import { FONTS } from '../tokens'
import huitzilopochtliRaw from '../assets/Gods/huitzilopochtli.svg?raw'

interface StartScreenWrathfulProps {
  dismissing: boolean
  onClick: () => void
}

export function StartScreenWrathful({ dismissing, onClick }: StartScreenWrathfulProps) {
  const [phase, setPhase] = useState<'intro' | 'punishment'>('intro')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FF2435',
        zIndex: 2000,
        overflow: 'hidden',
        animation: dismissing ? 'fadeFromBlack 0.6s ease forwards' : undefined,
      }}
    >
      <style>{`
        @keyframes wrathGodFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes wrathFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes wrathFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .wrath-cta-btn {
          background-color: transparent;
          color: #ffffff;
          transition: none;
        }
        .wrath-cta-btn:hover {
          background-color: #ffffff;
          color: #FF2435;
        }
      `}</style>

      {/* Corner gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(80,0,0,0.6) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* God face — shrinks on punishment phase */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: phase === 'punishment'
          ? 'translate(-50%, calc(-50% - 20vh))'
          : 'translate(-50%, calc(-50% - 12vh - 2.5vmin))',
        width: phase === 'punishment' ? '40vmin' : '57vmin',
        height: phase === 'punishment' ? '40vmin' : '57vmin',
        opacity: 0,
        animation: 'wrathGodFadeIn 2.5s ease 0.4s forwards',
        pointerEvents: 'none',
        zIndex: 3,
        transition: 'width 2.4s cubic-bezier(0.4,0,0.2,1), height 2.4s cubic-bezier(0.4,0,0.2,1), transform 2.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <GodSvg
          svgRaw={huitzilopochtliRaw}
          angerLevel="high"
          isHovered={true}
          filledEyes={true}
          eyeGlow={true}
          eyeAnimation={{
            fromColor: '#000000',
            fromWeight: 6,
            toColor: '#000000',
            toWeight: 6,
            delay: 0,
            duration: 0,
            id: 'wrath-main',
          }}
        />
      </div>

      {/* Intro text */}
      {phase === 'intro' && (
        <div style={{
          position: 'absolute',
          top: 'calc(50% - 12vh - 2.5vmin + 28.5vmin + 54px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 3,
          opacity: 0,
          animation: 'wrathGodFadeIn 1.6s ease 2.6s forwards',
        }}>
          <span style={{
            fontFamily: FONTS.spectral,
            fontSize: '28px',
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '0.5px',
            textTransform: 'capitalize',
          }}>
            <span style={{ fontFamily: FONTS.cinzel, fontWeight: 400, textTransform: 'uppercase' }}>Huitzilopochtli</span>
            {} Was Left Unappeased.
          </span>
        </div>
      )}

      {/* Punishment text */}
      {phase === 'punishment' && (
        <div style={{
          position: 'absolute',
          top: 'calc(50% + 7vh)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 3,
        }}>
          <span style={{
            fontFamily: FONTS.cinzel,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '14px',
            opacity: 0,
            animation: 'wrathFadeIn 1.6s ease 2.8s both',
          }}>
            Divine Punishment
          </span>
          <span style={{
            fontFamily: FONTS.spectral,
            fontSize: '28px',
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '0.5px',
            opacity: 0,
            animation: 'wrathFadeIn 1.8s ease 4.0s both',
          }}>
            Your Armies Fall. War Is No Longer Yours To Win
          </span>
          <span style={{
            fontFamily: FONTS.spectral,
            fontSize: '28px',
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '0.5px',
            opacity: 0,
            animation: 'wrathFadeIn 1.8s ease 4.0s both',
          }}>
            Until <span style={{ fontFamily: FONTS.cinzel, fontWeight: 400, textTransform: 'uppercase' }}>Huitzilopochtli</span> Is Appeased.
          </span>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={phase === 'intro' ? () => setPhase('punishment') : onClick}
        className="wrath-cta-btn"
        style={{
          position: 'absolute',
          bottom: '9vh',
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
          zIndex: 3,
          opacity: 0,
          animation: 'wrathGodFadeIn 1.2s ease 5.5s forwards',
        }}
      >
        {phase === 'intro' ? 'VIEW PUNISHMENT' : 'CONTINUE'}
      </button>
    </div>
  )
}
