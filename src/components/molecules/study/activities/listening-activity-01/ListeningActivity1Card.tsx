import { useEffect, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { css, styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { QuizSelectableFeedbackBox } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import QuizOptionImageFrameListeningActivity1 from '@components/molecules/study/quizOptions/images/QuizOptionImageFrameListeningActivity1'

export type ListeningActivity1CardProps = {
  image: string
  text: string
  index: number
  selectedIndex: number | null
  isCorrectAnswer: boolean
  isSolved: boolean
  onCardClick: (index: number) => void
}

const ListeningActivity1CardBox = styled(QuizSelectableFeedbackBox)<{
  $isSolved?: boolean
}>`
  min-width: 250px;
  width: calc(100% / 3 - 16px);
  min-height: 0;
  height: auto;
  cursor: ${(props) => (props.$isSolved ? 'default' : 'pointer')};
  pointer-events: ${(props) => (props.$isSolved ? 'none' : 'auto')};
  overflow: hidden;
  background: #fff;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: all 0.05s ease;

  ${({ $isCorrect }) =>
    $isCorrect &&
    css`
      box-shadow: none;
    `}

  ${media.mobile} {
    min-width: 0;
    width: 100%;
    min-height: 0;
    border-radius: 20px;
  }

  .card-text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    animation: cardTextFadeIn 0.5s ease-out forwards;
    font-family: 'Rg-B', 'Fredoka', sans-serif;
    font-size: 2.5em;
    font-weight: 600;

    ${media.mobile} {
      font-size: 1.75em;
    }

    @keyframes cardTextFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
`

export function ListeningActivity1Card({
  image,
  text,
  index,
  selectedIndex,
  isCorrectAnswer,
  isSolved,
  onCardClick,
}: ListeningActivity1CardProps) {
  const [showText, setShowText] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const isCorrect = selectedIndex === index && isCorrectAnswer

  useEffect(() => {
    if (!isCorrect) return
    const timer = setTimeout(() => setShowText(true), 500)
    return () => {
      clearTimeout(timer)
      setShowText(false)
    }
  }, [isCorrect])

  const displayText = isSolved || (selectedIndex !== null && showText)

  return (
    <ListeningActivity1CardBox
      $pressed={selectedIndex === index}
      $isCorrect={isSolved || (selectedIndex === index && isCorrectAnswer)}
      $isIncorrect={selectedIndex === index && !isCorrectAnswer}
      $isSolved={isSolved}
      onClick={() => onCardClick(index)}
    >
      {displayText && (
        <div className='card-text'>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      )}
      <QuizOptionImageFrameListeningActivity1>
        {!imageLoaded && <CardImageSkeleton />}
        <img
          src={image}
          alt=''
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </QuizOptionImageFrameListeningActivity1>
    </ListeningActivity1CardBox>
  )
}
