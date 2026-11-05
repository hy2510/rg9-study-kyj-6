import type { ImgHTMLAttributes } from 'react'

/**
 * <img> 기반 아이콘 컴포넌트의 공통 props.
 * - 외부에서 src 를 직접 지정하지 못하도록 제외 (각 아이콘이 자기 src 를 갖는다)
 */
export type ImgIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  width?: number
  height?: number
}
