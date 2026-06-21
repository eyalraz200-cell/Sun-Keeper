import { FONTS } from '../tokens'
import { ArrowDown } from '@phosphor-icons/react'
import { ChildrenIcon } from './ChildrenIcon'
import { VolunteerIcon } from './VolunteerIcon'
import { VirginIcon } from './VirginIcon'
import { PrisonerIcon } from './PrisonerIcon'
import type { Ritual } from '../data/gods'

interface ResourceBarProps {
  prisoners: number
  childrenCount: number
  virgins: number
  volunteers: number
  temples?: number
  greatTemples?: number
  prisonersTotal?: number
  volunteersTotal?: number
  childrenTotal?: number
  virginsTotal?: number
  templesTotal?: number
  greatTemplesTotal?: number
  selectedRitual?: Ritual | null
  hoveredRitual?: Ritual | null
  dimmed?: boolean
  twoRows?: boolean
  vertical?: boolean
}

export function ResourceBar({ prisoners, childrenCount, virgins, volunteers, temples = 14, greatTemples = 2, prisonersTotal = prisoners, volunteersTotal = volunteers, childrenTotal = childrenCount, virginsTotal = virgins, templesTotal = temples, greatTemplesTotal = greatTemples, selectedRitual, hoveredRitual, dimmed = false, twoRows = false, vertical = false }: ResourceBarProps) {
  const activeRitual = selectedRitual ?? hoveredRitual ?? null
  const showChange = !!selectedRitual

  if (vertical) {
    return (
      <div
        style={{
          flexShrink: 0,
          width: '168px',
          height: '100%',
          backgroundColor: '#181818',
          borderLeft: '1px solid #333333',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          gap: '0',
          opacity: dimmed ? 0.2 : 1,
          transition: 'opacity 0.2s ease',
          fontFamily: FONTS.spectral,
          overflowY: 'auto',
        }}
      >
        <span style={{ fontFamily: FONTS.spectral, fontSize: '10px', fontWeight: 300, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>Resources</span>
        <VerticalResourceItem icon={(c) => <PrisonerIcon size={13} color={c} />} label="Prisoners"  count={prisoners} total={prisonersTotal} cost={activeRitual?.participants.prisoners} ritualActive={!!activeRitual} showChange={showChange} />
        <VerticalResourceItem icon={(c) => <VolunteerIcon size={13} color={c} />} label="Volunteers" count={volunteers} total={volunteersTotal} cost={activeRitual?.participants.volunteers} ritualActive={!!activeRitual} showChange={showChange} />
        <VerticalResourceItem icon={(c) => <ChildrenIcon size={13} color={c} />} label="Children"   count={childrenCount} total={childrenTotal} cost={activeRitual?.participants.children} ritualActive={!!activeRitual} showChange={showChange} />
        <VerticalResourceItem icon={(c) => <VirginIcon size={13} color={c} />} label="Virgins"    count={virgins} total={virginsTotal} cost={activeRitual?.participants.virgins} ritualActive={!!activeRitual} showChange={showChange} />
        <div style={{ height: '1px', backgroundColor: '#333333', margin: '16px 0' }} />
        <VerticalSiteItem label="Temple" available={temples} total={templesTotal} cost={activeRitual?.sacredSite.name === 'Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
        <VerticalSiteItem label="Grand Temple" available={greatTemples} total={greatTemplesTotal} cost={activeRitual?.sacredSite.name === 'Grand Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink: 0,
        backgroundColor: '#181818',
        borderTop: '1px solid #333333',
        borderBottom: '1px solid #333333',
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: FONTS.spectral,
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: twoRows ? 'column' : 'row', alignItems: twoRows ? 'stretch' : 'center', justifyContent: 'flex-start', paddingLeft: '12px', paddingRight: '32px', paddingTop: '8px', paddingBottom: '8px', gap: twoRows ? '12px' : '24px', opacity: dimmed ? 0.2 : 1, transition: 'opacity 0.2s ease' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', fontWeight: 300, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px', whiteSpace: 'nowrap', marginRight: '8px' }}>Available Resources</span>
        {twoRows ? (
          <>
            {/* Row 1: all victims */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ResourceItem icon={(c) => <PrisonerIcon size={14} color={c} />} label="Prisoners"  count={prisoners} total={prisonersTotal} cost={activeRitual?.participants.prisoners} ritualActive={!!activeRitual} showChange={showChange} />
              <ResourceItem icon={(c) => <VolunteerIcon size={14} color={c} />} label="Volunteers" count={volunteers} total={volunteersTotal} cost={activeRitual?.participants.volunteers} ritualActive={!!activeRitual} showChange={showChange} />
              <ResourceItem icon={(c) => <ChildrenIcon size={14} color={c} />} label="Children"   count={childrenCount} total={childrenTotal} cost={activeRitual?.participants.children} ritualActive={!!activeRitual} showChange={showChange} />
              <ResourceItem icon={(c) => <VirginIcon size={14} color={c} />} label="Virgins"    count={virgins} total={virginsTotal} cost={activeRitual?.participants.virgins} ritualActive={!!activeRitual} showChange={showChange} />
            </div>
            <div style={{ height: '1px', backgroundColor: '#333333' }} />
            {/* Row 2: temples */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <SiteItem label="Temple" available={temples} total={templesTotal} cost={activeRitual?.sacredSite.name === 'Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
              <SiteItem label="Grand Temple" available={greatTemples} total={greatTemplesTotal} cost={activeRitual?.sacredSite.name === 'Grand Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
            </div>
          </>
        ) : (
          <>
            <ResourceItem icon={(c) => <PrisonerIcon size={14} color={c} />} label="Prisoners"  count={prisoners} total={prisonersTotal} cost={activeRitual?.participants.prisoners} ritualActive={!!activeRitual} showChange={showChange} />
            <ResourceItem icon={(c) => <VolunteerIcon size={14} color={c} />} label="Volunteers" count={volunteers} total={volunteersTotal} cost={activeRitual?.participants.volunteers} ritualActive={!!activeRitual} showChange={showChange} />
            <ResourceItem icon={(c) => <ChildrenIcon size={14} color={c} />} label="Children"   count={childrenCount} total={childrenTotal} cost={activeRitual?.participants.children} ritualActive={!!activeRitual} showChange={showChange} />
            <ResourceItem icon={(c) => <VirginIcon size={14} color={c} />} label="Virgins"    count={virgins} total={virginsTotal} cost={activeRitual?.participants.virgins} ritualActive={!!activeRitual} showChange={showChange} />
            <div style={{ width: '1px', height: '100%', backgroundColor: '#333333' }} />
            <SiteItem label="Temple" available={temples} total={templesTotal} cost={activeRitual?.sacredSite.name === 'Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
            <SiteItem label="Grand Temple" available={greatTemples} total={greatTemplesTotal} cost={activeRitual?.sacredSite.name === 'Grand Temple' ? activeRitual.sacredSite.count : 0} ritualActive={!!activeRitual} showChange={showChange} />
          </>
        )}
      </div>
    </div>
  )
}

interface SiteItemProps {
  label: string
  available: number
  total: number
  cost?: number
  ritualActive?: boolean
  showChange?: boolean
}

function SiteItem({ label, available, total, cost, ritualActive, showChange }: SiteItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'
    : '#848484'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.25)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s ease' }}>
      <div style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 400, color: labelColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{showChange && cost ? available - cost : available} / {total}</div>
        <ArrowDown size={12} color={valueColor} weight="bold" style={{ visibility: showChange && cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}

interface ResourceItemProps {
  icon: (color: string) => React.ReactNode
  label: string
  count: number
  total: number
  cost?: number
  ritualActive?: boolean
  showChange?: boolean
}

function ResourceItem({ icon, label, count, total, cost, ritualActive, showChange }: ResourceItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'
    : '#848484'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.25)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {icon(labelColor)}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 400, color: labelColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontSize: '14px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>
          {showChange && cost ? count - cost : count} / {total}
        </div>
        <ArrowDown size={12} color={valueColor} weight="bold" style={{ visibility: showChange && cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}

function VerticalResourceItem({ icon, label, count, total, cost, ritualActive, showChange }: ResourceItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)'
    : '#6c6c6c'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.2)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon(labelColor)}
        <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', fontWeight: 400, color: labelColor, letterSpacing: '0.3px', transition: 'color 0.2s ease' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '19px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>
          {showChange && cost ? count - cost : count} / {total}
        </span>
        <ArrowDown size={11} color={valueColor} weight="bold" style={{ visibility: showChange && cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}

function VerticalSiteItem({ label, available, total, cost, ritualActive, showChange }: SiteItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)'
    : '#6c6c6c'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.2)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
      <span style={{ fontFamily: FONTS.spectral, fontSize: '11px', fontWeight: 400, color: labelColor, letterSpacing: '0.3px', transition: 'color 0.2s ease' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontFamily: FONTS.spectral, fontSize: '14px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>
          {showChange && cost ? available - cost : available} / {total}
        </span>
        <ArrowDown size={11} color={valueColor} weight="bold" style={{ visibility: showChange && cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}
