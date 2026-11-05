/** 퀴즈 안내·피드백 문구용 스타일드 텍스트 */
import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import {
  useQuestionSoundSlot,
  useQuestionSoundSlotRef,
} from '@contexts/QuestionSoundSlotContext'

type QuizCommentProps = {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function QuizComment({
  children,
  style,
  className,
}: QuizCommentProps) {
  const slot = useQuestionSoundSlot()
  const slotRef = useQuestionSoundSlotRef()

  if (!slot) {
    return (
      <CommentText style={style} className={className}>
        {children}
      </CommentText>
    )
  }

  return (
    <CommentRow>
      <SoundSlot ref={slotRef} />
      <CommentText style={style} className={className}>
        {children}
      </CommentText>
    </CommentRow>
  )
}

const CommentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 40px;

  ${media.mobile} {
    gap: 0;
    min-height: 32px;
  }
`

const SoundSlot = styled.span`
  display: none;
  flex-shrink: 0;
  line-height: 0;

  &:not(:empty) {
    display: flex;
    align-items: center;
  }
`

const CommentText = styled.p`
  margin: 0;
  min-width: 0;
  min-height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-family: 'Chiron GoRound TC', sans-serif;
  font-size: 18.4px;
  font-weight: 600;
  line-height: 1.4;
  color: #a2b1c4;

  ${media.mobile} {
    padding: 10px;
    padding-bottom: 0;
    font-size: 16px;
    min-height: 32px;
  }

  ${CommentRow} & {
    ${media.mobile} {
      padding: 0;
      padding-left: 8px;
    }
  }
`
