import type { ImgHTMLAttributes } from 'react'

/**
 * <img> 기반 아이콘에서 width/height/alt 기본값을 보장하면서 사용자 지정 속성을 보존하는 헬퍼.
 *
 * - rest 에 width/height 가 와도 props 의 width/height 가 우선
 * - alt 가 없으면 빈 문자열 (접근성용 명시적 빈 alt)
 */
export function imgProps(
  width: number | undefined,
  height: number | undefined,
  rest: ImgHTMLAttributes<HTMLImageElement>,
): ImgHTMLAttributes<HTMLImageElement> {
  const { width: _rw, height: _rh, alt, ...r } = rest
  return {
    ...r,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    alt: alt ?? '',
  }
}
