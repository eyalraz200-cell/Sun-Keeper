import tlalocRaw from '../assets/Gods/Tlaloc.svg?raw'
import { GodSvg, type GodSvgProps } from './GodSvg'

type TlalocSvgProps = Omit<GodSvgProps, 'svgRaw'>

export function TlalocSvg(props: TlalocSvgProps) {
  return <GodSvg svgRaw={tlalocRaw} {...props} />
}
