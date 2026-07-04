import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import logoUrl from '../../assets/logo.svg'
import wallpaperUrl from '../../assets/mac-wallpaper.png'
import { FONTS } from '../../tokens'

// Everything in this component except the notification card is inert set dressing —
// a static macOS desktop backdrop meant to sell "an Omens Report just landed on your
// Mac," nothing more. No timers, no window/dock interactivity: it's a still image
// built out of DOM instead of a screenshot so it can crossfade into the real app.
const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif'

// Generic, hand-drawn glyphs evoking familiar mac app *categories* (browser, messages,
// mail, photos, music, trash) — not reproductions of any real app's actual icon artwork.
const DOCK_APPS: Array<{ name: string; gradient: string; glyph: ReactNode }> = [
  {
    name: 'Safari',
    gradient: 'linear-gradient(160deg, #eef6fb, #cfe8f7)',
    glyph: (
      <svg width="36" height="36" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#8a8a8a" strokeWidth="1" />
        <polygon points="12,12 15.5,8.5 13,13" fill="#ff3b30" />
        <polygon points="12,12 8.5,15.5 11,11" fill="#f2f2f2" stroke="#c7c7c7" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    name: 'Messages',
    gradient: 'linear-gradient(160deg, #7ee787, #2fb84f)',
    glyph: (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <path
          d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-4 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
          fill="#ffffff"
        />
      </svg>
    ),
  },
  {
    name: 'Mail',
    gradient: 'linear-gradient(160deg, #6dd5ff, #2f80ed)',
    glyph: (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <path d="M4 7l8 6 8-6" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Photos',
    gradient: 'linear-gradient(160deg, #2c2c2c, #151515)',
    glyph: (
      <svg width="36" height="36" viewBox="0 0 24 24">
        <g transform="translate(12,12)">
          <path d="M0,0 L0,-8 A4,4 0 0 1 4,-3 Z" fill="#ff5a3c" />
          <path d="M0,0 L4,-3 A4,4 0 0 1 3,4.5 Z" fill="#ffcc33" />
          <path d="M0,0 L3,4.5 A4,4 0 0 1 -3,4.5 Z" fill="#34c759" />
          <path d="M0,0 L-3,4.5 A4,4 0 0 1 -4,-3 Z" fill="#2f80ed" />
          <path d="M0,0 L-4,-3 A4,4 0 0 1 0,-8 Z" fill="#af52de" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Music',
    gradient: 'linear-gradient(160deg, #fa6a8b, #fc3158)',
    glyph: (
      <svg width="30" height="30" viewBox="0 0 24 24">
        <circle cx="7" cy="17.5" r="2.3" fill="#ffffff" />
        <circle cx="16.5" cy="15.5" r="2.3" fill="#ffffff" />
        <path d="M9.3 17.5V6.5l9-2v11" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Trash',
    gradient: 'linear-gradient(160deg, #d8dde1, #9aa4ab)',
    glyph: (
      <svg width="30" height="30" viewBox="0 0 24 24">
        <path
          d="M5 7h14M9.5 7V5.3A1.3 1.3 0 0 1 10.8 4h2.4a1.3 1.3 0 0 1 1.3 1.3V7M7.5 7l.9 12a2 2 0 0 0 2 1.9h3.2a2 2 0 0 0 2-1.9l.9-12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

interface MacDesktopIntroProps {
  onEnter: () => void
  // Fired instead of onEnter when the punishment notification specifically is clicked, so the
  // parent can enter the app AND immediately surface GodPunishmentDialog on top of it.
  onPunishmentAlert: () => void
  punishingGodName: string
}

export function MacDesktopIntro({ onEnter, onPunishmentAlert, punishingGodName }: MacDesktopIntroProps) {
  const [notificationHovered, setNotificationHovered] = useState(false)
  const [punishmentNotificationHovered, setPunishmentNotificationHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        overflow: 'hidden',
        fontFamily: SYSTEM_FONT,
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Menu bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: 12.5,
          color: 'rgba(255,255,255,0.92)',
          background: 'rgba(20,20,20,0.35)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="12" height="14" viewBox="0 0 170 170" aria-hidden style={{ opacity: 0.92 }}>
            <path
              fill="currentColor"
              d="M150 55c-13 1-24 12-24 26 0 15 9 22 18 22 1 0-1 5-5 11-6 9-13 18-22 18-8 0-11-5-21-5-10 0-14 5-22 5-9 0-16-9-22-18-13-19-23-52-9-75 7-12 19-19 30-19 9 0 17 6 22 6 5 0 15-7 25-6 4 0 15 2 22 12-1 1-13 8-12 23zM108 33c5-6 9-15 8-24-8 0-18 5-23 12-5 6-9 15-8 23 8 1 18-5 23-11z"
            />
          </svg>
          <span style={{ fontWeight: 600 }}>Finder</span>
          <span style={{ opacity: 0.85 }}>File</span>
          <span style={{ opacity: 0.85 }}>Edit</span>
          <span style={{ opacity: 0.85 }}>View</span>
          <span style={{ opacity: 0.85 }}>Go</span>
          <span style={{ opacity: 0.85 }}>Window</span>
          <span style={{ opacity: 0.85 }}>Help</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="15" height="11" viewBox="0 0 16 12" aria-hidden style={{ opacity: 0.9 }}>
            <path
              fill="currentColor"
              d="M8 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm0-3.4c1.6 0 3 .6 4.1 1.6l-1.2 1.3A4 4 0 0 0 8 8a4 4 0 0 0-2.9 1.1L3.9 7.8A5.9 5.9 0 0 1 8 6.2Zm0-3.4c2.6 0 5 1 6.8 2.7l-1.2 1.3A7.4 7.4 0 0 0 8 4.8a7.4 7.4 0 0 0-5.6 2l-1.2-1.3A9.4 9.4 0 0 1 8 2.8Z"
            />
          </svg>
          <svg width="22" height="11" viewBox="0 0 24 12" aria-hidden style={{ opacity: 0.9 }}>
            <rect x="1" y="1.5" width="19" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="2.5" y="3" width="13" height="6" rx="1" fill="currentColor" />
            <rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor" />
          </svg>
          <span>Fri Jul 4 9:41 AM</span>
        </div>
      </div>

      {/* Desktop widgets (Sonoma-style widget stack) — static, decorative only */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 24,
          display: 'flex',
          gap: 22,
        }}
      >
        {/* Calendar widget */}
        <div
          style={{
            width: 210,
            height: 210,
            borderRadius: 34,
            overflow: 'hidden',
            background: 'rgba(28,28,30,0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: 44,
              background: '#fc3d39',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#ffffff',
            }}
          >
            FRIDAY
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 86, fontWeight: 300, color: '#ffffff', lineHeight: 1 }}>4</span>
            <span style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>July</span>
          </div>
        </div>

        {/* Weather widget */}
        <div
          style={{
            width: 210,
            height: 210,
            borderRadius: 34,
            padding: '20px 22px',
            background: 'linear-gradient(160deg, #5aa7e0, #2f6bc4)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>Teotihuacan</span>
            <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="4.5" fill="#ffd257" />
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI) / 4
                const x1 = 12 + Math.cos(angle) * 7
                const y1 = 12 + Math.sin(angle) * 7
                const x2 = 12 + Math.cos(angle) * 10.5
                const y2 = 12 + Math.sin(angle) * 10.5
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd257" strokeWidth="1.6" strokeLinecap="round" />
              })}
            </svg>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 54, fontWeight: 200, color: '#ffffff' }}>89°</span>
          </div>
          <div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>Sunny</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>H:91° L:76°</div>
          </div>
        </div>
      </div>

      {/* Finder window — a second static "app window" sitting on the desktop, opened
          under the widgets/wallpaper but above nothing else; the dock and notification
          still render after it in DOM order so they stack above it, matching real macOS. */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 40,
          width: 620,
          height: 400,
          maxWidth: 'calc(100% - 80px)',
          borderRadius: 10,
          overflow: 'hidden',
          background: '#2b2b2d',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 12px',
            background: '#3a3a3c',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, opacity: 0.6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M15 4 7 12l8 8" /></svg>
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M9 4l8 8-8 8" /></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Documents</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.55 }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="7" rx="1" fill="#fff" /><rect x="13" y="4" width="8" height="7" rx="1" fill="#fff" /><rect x="3" y="13" width="8" height="7" rx="1" fill="#fff" /><rect x="13" y="13" width="8" height="7" rx="1" fill="#fff" /></svg>
            <svg width="13" height="13" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="#fff" strokeWidth="2" /><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Sidebar */}
          <div
            style={{
              width: 180,
              flexShrink: 0,
              background: '#252527',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              padding: '14px 10px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', padding: '0 8px', marginBottom: 6 }}>
              Favorites
            </div>
            {['AirDrop', 'Recents', 'Applications'].map(item => (
              <div key={item} style={{ padding: '5px 8px', borderRadius: 6 }}>{item}</div>
            ))}
            <div style={{ padding: '5px 8px', borderRadius: 6, background: '#0a5fd7', color: '#fff' }}>Documents</div>
            {['Downloads', 'Desktop'].map(item => (
              <div key={item} style={{ padding: '5px 8px', borderRadius: 6 }}>{item}</div>
            ))}
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', padding: '0 8px', margin: '14px 0 6px' }}>
              Locations
            </div>
            <div style={{ padding: '5px 8px', borderRadius: 6 }}>Macintosh HD</div>
            <div style={{ padding: '5px 8px', borderRadius: 6 }}>iCloud Drive</div>
          </div>

          {/* File grid */}
          <div
            style={{
              flex: 1,
              background: '#1e1e1f',
              padding: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 18,
              alignContent: 'start',
            }}
          >
            {['Rituals', 'Gods', 'Assets', 'Omens', 'Resources', 'Calendar'].map(name => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <svg width="42" height="34" viewBox="0 0 42 34">
                  <path d="M2 4a2 2 0 0 1 2-2h10l4 4h20a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" fill="#5aa7ea" />
                </svg>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>{name}</span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#151515', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logoUrl} alt="" style={{ width: 16, height: 19 }} />
              </div>
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>Tribute</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dock */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 14,
          padding: '12px 14px',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 16,
            background: '#151515',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          <img src={logoUrl} alt="" style={{ width: 31, height: 38 }} />
        </div>
        <div style={{ width: 1, height: 56, background: 'rgba(255,255,255,0.18)', margin: '0 2px' }} />
        {DOCK_APPS.map(app => (
          <div
            key={app.name}
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              background: app.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
            }}
          >
            {app.glyph}
          </div>
        ))}
      </div>

      {/* Notification — the only interactive element on this screen */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9, ease: 'easeOut' }}
        onClick={onEnter}
        onMouseEnter={() => setNotificationHovered(true)}
        onMouseLeave={() => setNotificationHovered(false)}
        style={{
          position: 'absolute',
          top: 34,
          right: 12,
          width: 340,
          padding: '12px 14px',
          borderRadius: 14,
          cursor: 'pointer',
          background: notificationHovered ? 'rgba(38,38,38,0.82)' : 'rgba(28,28,28,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          transition: 'background-color 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: '#151515',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={logoUrl} alt="" style={{ width: 10, height: 12 }} />
          </div>
          <span style={{ fontFamily: FONTS.spectral, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.55)' }}>
            TRIBUTE
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>now</span>
        </div>
        <div style={{ marginTop: 5, fontSize: 14, fontWeight: 600, color: '#ffffff' }}>New Bad Omens Observed</div>
        <div style={{ marginTop: 2, fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,0.82)' }}>
          6 gods have become furious and demand appeasement.
        </div>
      </motion.div>

      {/* Second notification — stacked below the first, same mac-notification chrome. Clicking
          it enters the app and immediately surfaces GodPunishmentDialog (see App.tsx). */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
        onClick={onPunishmentAlert}
        onMouseEnter={() => setPunishmentNotificationHovered(true)}
        onMouseLeave={() => setPunishmentNotificationHovered(false)}
        style={{
          position: 'absolute',
          top: 140,
          right: 12,
          width: 340,
          padding: '12px 14px',
          borderRadius: 14,
          cursor: 'pointer',
          background: punishmentNotificationHovered ? 'rgba(38,38,38,0.82)' : 'rgba(28,28,28,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          transition: 'background-color 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: '#151515',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={logoUrl} alt="" style={{ width: 10, height: 12 }} />
          </div>
          <span style={{ fontFamily: FONTS.spectral, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.55)' }}>
            TRIBUTE
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>now</span>
        </div>
        <div style={{ marginTop: 5, fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
          {punishingGodName} Is Punishing The Empire
        </div>
        <div style={{ marginTop: 2, fontSize: 13, lineHeight: 1.4, color: 'rgba(255,255,255,0.82)' }}>
          Left unappeased, {punishingGodName}'s wrath will fall on the empire.
        </div>
      </motion.div>
    </motion.div>
  )
}
