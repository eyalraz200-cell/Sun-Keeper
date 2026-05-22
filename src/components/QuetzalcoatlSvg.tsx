import quetzalcoatlRaw from '../assets/Gods/Quetzalcoatl.svg?raw'
import { GodSvg, type GodSvgProps } from './GodSvg'

type QuetzalcoatlSvgProps = Omit<GodSvgProps, 'svgRaw'>

export function QuetzalcoatlSvg(props: QuetzalcoatlSvgProps) {
  return <GodSvg svgRaw={quetzalcoatlRaw} {...props} />
}
