import type { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'

/* -------------------------------------------------------------------------- */
/*  보기(선택지) 카드 내 이미지 영역 베이스 — molecule에서 styled()로 확장 */
/* -------------------------------------------------------------------------- */

const Shell = styled.div`
  position: relative;
  width: 100%;
`

export type QuizOptionImageFrameProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function QuizOptionImageFrame({
  children,
  className,
  style,
}: QuizOptionImageFrameProps) {
  return (
    <Shell className={className} style={style}>
      {children}
    </Shell>
  )
}
