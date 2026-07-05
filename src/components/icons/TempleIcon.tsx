interface TempleIconProps {
  size?: number
  color?: string
}

export function TempleIcon({ size = 24, color = 'currentColor' }: TempleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 512.039 512.039" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="m506.161 241.877-236-236c-7.812-7.811-20.474-7.811-28.285 0l-236 236c-12.562 12.563-3.65 34.143 14.142 34.143h56v196h-34.302c-11.045 0-20 8.954-20 20s8.955 20 20 20h428.604c11.046 0 20-8.954 20-20s-8.954-20-20-20h-34.302v-196h56c17.768 0 26.722-21.561 14.143-34.143zm-390.143 230.143v-196h36v196zm204-196v196h-128v-196zm76 196h-36v-196h36zm-327.716-236 187.716-187.716 187.716 187.716c-12.963 0-364.783 0-375.432 0z"/>
    </svg>
  )
}
