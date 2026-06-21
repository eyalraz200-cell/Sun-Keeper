import { FONTS } from '../tokens'

interface ScreenChooserProps {
  onChoose: (screen: 'regular' | 'wrathful') => void
}

export function ScreenChooser({ onChoose }: ScreenChooserProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#181818',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
      }}
    >
      <style>{`
        @keyframes chooserFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chooser-btn {
          background-color: transparent;
          color: #ffffff;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .chooser-btn:hover {
          background-color: #ffffff;
          color: #181818;
        }
        .chooser-btn-wrath {
          background-color: transparent;
          color: rgba(200,50,46,0.85);
          cursor: pointer;
          border-color: rgba(200,50,46,0.5) !important;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .chooser-btn-wrath:hover {
          background-color: rgba(200,50,46,0.85);
          color: #ffffff;
          border-color: rgba(200,50,46,0.85) !important;
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: 0,
        animation: 'chooserFadeIn 0.8s ease 0.2s forwards',
      }}>
        <span style={{
          fontFamily: FONTS.cinzel,
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>
          Choose your opening
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        opacity: 0,
        animation: 'chooserFadeIn 0.8s ease 0.5s forwards',
      }}>
        <button
          className="chooser-btn"
          onClick={() => onChoose('regular')}
          style={{
            fontFamily: FONTS.spectral,
            fontSize: '15px',
            fontWeight: 400,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '6px',
            padding: '12px 40px',
            whiteSpace: 'nowrap',
          }}
        >
          Regular
        </button>
        <button
          className="chooser-btn-wrath"
          onClick={() => onChoose('wrathful')}
          style={{
            fontFamily: FONTS.spectral,
            fontSize: '15px',
            fontWeight: 400,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            border: '1px solid rgba(200,50,46,0.5)',
            borderRadius: '6px',
            padding: '12px 40px',
            whiteSpace: 'nowrap',
          }}
        >
          Secondary
        </button>
      </div>
    </div>
  )
}
