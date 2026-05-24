import { FONTS, LAYOUT } from '../tokens'
import { ArrowDown } from '@phosphor-icons/react'
import { ChildrenIcon } from './ChildrenIcon'
import { VolunteerIcon } from './VolunteerIcon'
import { VirginIcon } from './VirginIcon'
import { PrisonerIcon } from './PrisonerIcon'
import type { Ritual } from '../data/gods'

interface ResourceBarProps {
  prisoners: number
  children: number
  virgins: number
  volunteers: number
  temples?: number
  greatTemples?: number
  selectedRitual?: Ritual | null
  dimmed?: boolean
}

export function ResourceBar({ prisoners, children, virgins, volunteers, temples = 14, greatTemples = 2, selectedRitual, dimmed = false }: ResourceBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: `${LAYOUT.bottomBarHeight}px`,
        backgroundColor: '#181818',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: FONTS.spectral,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '32px', paddingRight: '32px', paddingTop: '12px', paddingBottom: '12px' }}>
        <ResourceItem icon={(c) => <PrisonerIcon size={20} color={c} />} label="Prisoners"  count={prisoners} cost={selectedRitual?.participants.prisoners} ritualActive={!!selectedRitual} />
        <ResourceItem icon={(c) => <VolunteerIcon size={20} color={c} />} label="Volunteers" count={volunteers} cost={selectedRitual?.participants.volunteers} ritualActive={!!selectedRitual} />
        <ResourceItem icon={(c) => <ChildrenIcon size={20} color={c} />} label="Children"   count={children} cost={selectedRitual?.participants.children} ritualActive={!!selectedRitual} />
        <ResourceItem icon={(c) => <VirginIcon size={20} color={c} />} label="Virgins"    count={virgins} cost={selectedRitual?.participants.virgins} ritualActive={!!selectedRitual} />
        <div style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <SiteItem label="Temple" available={temples} total={20} cost={selectedRitual?.sacredSite.name === 'Temple' ? selectedRitual.sacredSite.count : 0} ritualActive={!!selectedRitual} />
        <SiteItem label="Grand Temple" available={greatTemples} total={3} cost={selectedRitual?.sacredSite.name === 'Grand Temple' ? selectedRitual.sacredSite.count : 0} ritualActive={!!selectedRitual} />
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
}

function SiteItem({ label, available, total, cost, ritualActive }: SiteItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'
    : '#848484'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.25)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s ease' }}>
      <div style={{ fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: labelColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{cost ? available - cost : available} available</div>
        <ArrowDown size={12} color={valueColor} weight="bold" style={{ visibility: cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}

interface ResourceItemProps {
  icon: (color: string) => React.ReactNode
  label: string
  count: number
  cost?: number
  ritualActive?: boolean
}

function ResourceItem({ icon, label, count, cost, ritualActive }: ResourceItemProps) {
  const affected = (cost ?? 0) > 0
  const labelColor = ritualActive
    ? affected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'
    : '#848484'
  const valueColor = ritualActive
    ? affected ? '#ffffff' : 'rgba(255,255,255,0.25)'
    : '#aaaaaa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon(labelColor)}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 400, color: labelColor, lineHeight: '1', transition: 'color 0.2s ease' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontSize: '16px', fontWeight: 400, color: valueColor, lineHeight: '1', transition: 'color 0.2s ease' }}>
          {cost ? count - cost : count}
        </div>
        <ArrowDown size={12} color={valueColor} weight="bold" style={{ visibility: cost ? 'visible' : 'hidden' }} />
      </div>
    </div>
  )
}
