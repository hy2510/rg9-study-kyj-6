import { useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { QuizSelectableFeedbackBox } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import QuizOptionImageFrameLargeChoice from '@components/molecules/study/quizOptions/images/QuizOptionImageFrameLargeChoice'

export type LargeImageQuizChoiceCardProps = {
  index: number
  image: string
  text: string
  selectedText: string | null
  isCorrect: boolean
  isIncorrect: boolean
  reserveLoadingHeight?: boolean
  onCardClick: (index: number) => void
}

const LargeImageQuizChoiceCardBox = styled(QuizSelectableFeedbackBox)`
  cursor: pointer;
  width: 100%;
  min-height: 30vh;
  padding: 10px 0;
  box-sizing: border-box;
  overflow: hidden;
  background: #fff;
  border-radius: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: all 0.05s ease;

  ${media.tablet} {
    min-height: 40vh;
  }

  @media (max-height: 900px) {
    min-height: 45vh;
  }

  ${media.mobile} {
    border-radius: 20px;
    min-height: 25vh;
  }
`

export function LargeImageQuizChoiceCard({
  index,
  image,
  text,
  selectedText,
  isCorrect,
  isIncorrect,
  reserveLoadingHeight = false,
  onCardClick,
}: LargeImageQuizChoiceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <LargeImageQuizChoiceCardBox
      $pressed={selectedText === text}
      $isCorrect={isCorrect}
      $isIncorrect={isIncorrect}
      onClick={() => onCardClick(index)}
    >
      <QuizOptionImageFrameLargeChoice
        $reserveLoadingHeight={reserveLoadingHeight}
      >
        {!imageLoaded && <CardImageSkeleton />}
        <img
          src={image}
          alt=''
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </QuizOptionImageFrameLargeChoice>
    </LargeImageQuizChoiceCardBox>
  )
}
