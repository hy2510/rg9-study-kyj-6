import { useEffect, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import {
  quizSelectablePressedStyle,
  resolveQuizSelectableFeedback,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

export type ListeningActivity2CardProps = {
  text: string
  index: number
  selectedIndex: number | null
  isCorrectAnswer?: boolean
  isSolved?: boolean
  onCardClick: (index: number) => void
}

const ListeningActivity2CardBox = styled.div<{
  $pressed?: boolean
  $isCorrect?: boolean
  $isIncorrect?: boolean
  $showResultText?: boolean
}>`
  /* CardText 가 카드 폭 기반으로 font-size 를 축소할 수 있도록 컨테이너 지정. */
  container-type: inline-size;
  min-width: 250px;
  width: calc(100% / 3 - 16px);
  min-height: 168px;
  height: auto;
  cursor: pointer;
  overflow: hidden;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: all 0.05s ease;
  background: ${(props) =>
    props.$showResultText
      ? '#E9EDF3'
      : resolveQuizSelectableFeedback(props).bg};
  border: ${(props) =>
    props.$showResultText
      ? '1.5px solid #e9edf3'
      : resolveQuizSelectableFeedback(props).border};
  box-shadow: ${(props) =>
    props.$showResultText
      ? '0 3px 0 0 #e9edf3'
      : resolveQuizSelectableFeedback(props).boxShadow};

  ${(props) => props.$pressed && quizSelectablePressedStyle}

  ${media.mobile} {
    min-width: 0;
    width: 100%;
    min-height: 140px;
    border-radius: 20px;
  }
`

const CardText = styled(TextBox)`
  padding: 0 12px;
  text-align: center;
  /* 컨테이너 쿼리 미지원 브라우저 대비 최후 폴백:
     긴 단일 단어(예: "underground") 가 카드 폭을 초과할 때 줄바꿈 허용. */
  overflow-wrap: break-word;
  word-break: break-word;

  /* 카드 폭(inline-size) 의 13% 를 상한으로 폰트 자동 축소.
     기본 2.5em(40px) 은 유지되며, 카드가 좁을 때만 축소되어 클리핑을 방지한다.
     - 카드 250px(min-width): 32.5px → "underground"(11자) 여유롭게 수용
     - 카드 300px: 39px, 340px+ 부터 2.5em 상한 유지 */
  font-size: min(2.5em, 13cqw);

  ${media.mobile} {
    font-size: min(1.75em, 13cqw);
  }
`

export function ListeningActivity2Card({
  text,
  index,
  selectedIndex,
  isCorrectAnswer = false,
  isSolved = false,
  onCardClick,
}: ListeningActivity2CardProps) {
  const [showResultText, setShowResultText] = useState(false)

  const isCorrect = selectedIndex === index && isCorrectAnswer

  useEffect(() => {
    if (!isCorrect) return
    const timer = setTimeout(() => setShowResultText(true), 1000)
    return () => {
      clearTimeout(timer)
      setShowResultText(false)
    }
  }, [isCorrect])

  return (
    <ListeningActivity2CardBox
      $pressed={isSolved || selectedIndex === index}
      $isCorrect={isSolved || (selectedIndex === index && isCorrectAnswer)}
      $isIncorrect={!isSolved && selectedIndex === index && !isCorrectAnswer}
      $showResultText={isSolved || (isCorrect && showResultText)}
      onClick={() => onCardClick(index)}
    >
      <CardText
        fontSize={2.5}
        fontWeight={6}
        color={
          isSolved || (isCorrect && showResultText) ? 'secondary' : 'primary'
        }
      >
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </CardText>
    </ListeningActivity2CardBox>
  )
}
