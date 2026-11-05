import { media } from '@styles/tokens/breakpoints'
import type { CSSProperties, ReactNode } from 'react'
import styled from 'styled-components'

/* -------------------------------------------------------------------------- */
/*  베이스 문제 이미지 프레임 — molecule에서 styled()로 확장 (별도 토큰 파일 없음) */
/* -------------------------------------------------------------------------- */

export const QUESTION_IMAGE_FRAME_HEIGHT_PX = 250

const QUESTION_IMAGE_FRAME_PADDING_PX = 10
const QUESTION_IMAGE_FRAME_BORDER_RADIUS = 25

const Shell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  height: auto;
  min-height: 0;
  padding: ${QUESTION_IMAGE_FRAME_PADDING_PX}px;
  background-color: #fff;
  border-radius: ${QUESTION_IMAGE_FRAME_BORDER_RADIUS}px;
  border: 1.5px solid #e9edf3;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  ${media.mobile} {
    width: 100%;
  }
`

export type QuestionImageFrameProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function QuestionImageFrame({
  children,
  className,
  style,
}: QuestionImageFrameProps) {
  return (
    <Shell className={className} style={style}>
      {children}
    </Shell>
  )
}
