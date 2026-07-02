interface PyramidIconProps {
  size?: number
  color?: string
}

export function PyramidIcon({ size = 24, color = 'currentColor' }: PyramidIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="m492 334.368h-39v-98c0-11.046-8.954-20-20-20h-39v-98c0-11.046-8.954-20-20-20h-39v-58.736c0-11.046-8.954-20-20-20h-118c-11.046 0-20 8.954-20 20v58.737h-39c-11.046 0-20 8.954-20 20v98h-39c-11.046 0-20 8.954-20 20v98h-39c-11.046 0-20 8.954-20 20v118c0 11.046 8.954 20 20 20h472c11.046 0 20-8.954 20-20v-118c0-11.046-8.954-20.001-20-20.001zm-275-274.736h78v38.737h-78zm-59 78.736h196v78h-196zm-59 118h314v78h-314zm373 196h-432v-78h432z"/>
    </svg>
  )
}
