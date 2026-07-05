import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS, FONT_SIZE, FONT_WEIGHT, EYE, SPACING } from '../../tokens'
import { GodSvg } from '../gods/GodSvg'
import { getSvgRaw } from '../gods/GodCard'
import type { God } from '../../data/gods'

interface GodPunishmentDialogProps {
  god: God
  onAppeaseNow: () => void
  onAppeaseLater: () => void
}

// Figma node 244:10627 (rough draft). The face card reuses the app's existing render-layer red
// (EYE.high, the same bright red used for a Furious god's own eye ring) as the card fill, matching
// the punishing treatment GodCard uses elsewhere (see GodCard.tsx) — brighter than the data-layer
// ANGER.high this used before. Eyes are forced black (GodSvg's eyeColor override) rather than the
// usual anger-level red — a red ring reads poorly against a red card.
// Per-god punishment flavor text — falls back to the generic "wrath" line for
// any god without a domain-specific threat written yet.
// Exported so MacDesktopIntro's punishment notification can show the exact same threat text
// instead of a separately hand-written sentence drifting out of sync with this dialog.
export const PUNISHMENT_THREATS: Partial<Record<string, string>> = {
  tlaloc: "Not a drop of rain will fall upon the empire until he is appeased",
}

export function GodPunishmentDialog({ god, onAppeaseNow, onAppeaseLater }: GodPunishmentDialogProps) {
  const godNameUpper = god.name.toUpperCase()
  const threatText = PUNISHMENT_THREATS[god.id] ?? `The empire will suffer ${godNameUpper}'s wrath until he is appeased`
  const [laterHovered, setLaterHovered] = useState(false)
  const [nowHovered, setNowHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: '608px',
          backgroundColor: COLORS.black,
          borderRadius: '4px',
          boxShadow: '0 0 36px 8px rgba(0,0,0,0.6)',
          padding: '48px 40px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '265px',
            height: '362px',
            borderRadius: '6px',
            border: '1.5px solid rgba(77,77,77,0.56)',
            backgroundColor: EYE.high.color,
            backgroundImage: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '171px', height: '265px' }}>
            <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel="high" bodyColor={COLORS.white} eyeColor={COLORS.gray0} instanceId={`punish-${god.id}`} />
          </div>
        </div>

        <p
          style={{
            margin: 0,
            marginTop: SPACING.xl,
            fontFamily: FONTS.spectral,
            fontSize: FONT_SIZE.xl,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.white,
            letterSpacing: '1.2px',
            textAlign: 'center',
          }}
        >
          <span style={{ textTransform: 'uppercase' }}>{godNameUpper}</span> is punishing the empire
        </p>

        <p
          style={{
            margin: 0,
            marginTop: SPACING.sm,
            fontFamily: FONTS.spectral,
            fontSize: FONT_SIZE.lg,
            fontWeight: FONT_WEIGHT.light,
            color: COLORS.gray80,
            letterSpacing: '0.96px',
            textAlign: 'center',
          }}
        >
{threatText}
        </p>

        <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.xxl }}>
          <button
            onClick={onAppeaseLater}
            onMouseEnter={() => setLaterHovered(true)}
            onMouseLeave={() => setLaterHovered(false)}
            style={{
              fontFamily: FONTS.spectral,
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.medium,
              letterSpacing: '0.96px',
              color: COLORS.white,
              backgroundColor: laterHovered ? COLORS.gray20 : 'transparent',
              border: `1px solid ${COLORS.white}`,
              borderRadius: '4px',
              padding: `${SPACING.sm} ${SPACING.xl}`,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Appease Later
          </button>
          <button
            onClick={onAppeaseNow}
            onMouseEnter={() => setNowHovered(true)}
            onMouseLeave={() => setNowHovered(false)}
            style={{
              fontFamily: FONTS.spectral,
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.medium,
              letterSpacing: '0.96px',
              color: COLORS.gray0,
              backgroundColor: nowHovered ? COLORS.white : COLORS.gray95,
              border: 'none',
              borderRadius: '4px',
              padding: `${SPACING.sm} ${SPACING.xl}`,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Appease Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
