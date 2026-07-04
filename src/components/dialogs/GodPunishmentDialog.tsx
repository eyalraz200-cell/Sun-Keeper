import { motion } from 'framer-motion'
import { COLORS, FONTS, FONT_SIZE, FONT_WEIGHT, ANGER, SPACING } from '../../tokens'
import { GodSvg } from '../gods/GodSvg'
import { getSvgRaw } from '../gods/GodCard'
import type { God } from '../../data/gods'

interface GodPunishmentDialogProps {
  god: God
  onAppeaseNow: () => void
  onAppeaseLater: () => void
}

// Figma node 244:10627 (rough draft). The face card reuses the app's existing anger palette
// instead of the mock's one-off pure red: ANGER.high as the card fill and EYE.high as the eye
// ring keeps this on the same two-tier data/render red the rest of the app already uses (see
// GodCard/RitualCard), so the eyes still read against the backdrop instead of disappearing into
// a matching red.
export function GodPunishmentDialog({ god, onAppeaseNow, onAppeaseLater }: GodPunishmentDialogProps) {
  const godNameUpper = god.name.toUpperCase()

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
            backgroundColor: ANGER.high,
            backgroundImage: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '171px', height: '265px' }}>
            <GodSvg svgRaw={getSvgRaw(god.id)} angerLevel="high" bodyColor={COLORS.white} instanceId={`punish-${god.id}`} />
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
The empire will suffer {godNameUpper}'s wrath until he is appeased
        </p>

        <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.xxl }}>
          <button
            onClick={onAppeaseLater}
            style={{
              fontFamily: FONTS.spectral,
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.medium,
              letterSpacing: '0.96px',
              color: COLORS.white,
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.white}`,
              borderRadius: '4px',
              padding: SPACING.sm,
              cursor: 'pointer',
            }}
          >
            Appease {godNameUpper} Later
          </button>
          <button
            onClick={onAppeaseNow}
            style={{
              fontFamily: FONTS.spectral,
              fontSize: FONT_SIZE.lg,
              fontWeight: FONT_WEIGHT.medium,
              letterSpacing: '0.96px',
              color: COLORS.gray0,
              backgroundColor: COLORS.white,
              border: 'none',
              borderRadius: '4px',
              padding: SPACING.sm,
              cursor: 'pointer',
            }}
          >
            Appease {godNameUpper} Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
