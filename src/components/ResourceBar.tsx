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
        <ResourceItem icon={<PrisonerIcon size={20} color="rgba(255,255,255,0.55)" />} label="Prisoners"  count={prisoners} cost={selectedRitual?.participants.prisoners} />
        <ResourceItem icon={<VolunteerIcon size={20} color="rgba(255,255,255,0.55)" />} label="Volunteers" count={volunteers} cost={selectedRitual?.participants.volunteers} />
        <ResourceItem icon={<ChildrenIcon size={20} color="rgba(255,255,255,0.55)" />} label="Children"   count={children} cost={selectedRitual?.participants.children} />
        <ResourceItem icon={<VirginIcon size={20} color="rgba(255,255,255,0.55)" />} label="Virgins"    count={virgins} cost={selectedRitual?.participants.virgins} />
        <div style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <SiteItem label="Temple" available={temples} total={20} cost={selectedRitual?.sacredSite.name === 'Temple' ? selectedRitual.sacredSite.count : 0} />
        <SiteItem label="Grand Temple" available={greatTemples} total={3} cost={selectedRitual?.sacredSite.name === 'Grand Temple' ? selectedRitual.sacredSite.count : 0} />
      </div>
    </div>
  )
}

interface SiteItemProps {
  label: string
  available: number
  total: number
  cost?: number
}

function SiteItem({ label, available, total, cost }: SiteItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: '#acacac', lineHeight: '1' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontFamily: FONTS.spectral, fontSize: '16px', fontWeight: 400, color: '#ffffff', lineHeight: '1' }}>{cost ? available - cost : available} available</div>
        {cost ? <ArrowDown size={12} color="#6c6c6c" weight="bold" /> : null}
      </div>
    </div>
  )
}

interface ResourceItemProps {
  icon: React.ReactNode
  label: string
  count: number
  cost?: number
}

function ResourceItem({ icon, label, count, cost }: ResourceItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 400, color: '#acacac', lineHeight: '1' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ fontSize: '16px', fontWeight: 400, color: '#ffffff', lineHeight: '1' }}>
          {cost ? count - cost : count}
        </div>
        {cost ? <ArrowDown size={12} color="#6c6c6c" weight="bold" /> : null}
      </div>
    </div>
  )
}
