import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import ListeningActivity1CardsSection from '@components/organisms/study/sections/ListeningActivity1CardsSection'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

interface ListeningActivity1Props {
  quizData: BaseQuiz[]
  onComplete: () => void
}

export default function ListeningActivity1({
  quizData,
  onComplete,
}: ListeningActivity1Props) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [correctIndices, setCorrectIndices] = useState<Set<number>>(new Set())

  const handleCardClick = (index: number) => {
    if (selectedIndex !== null || correctIndices.has(index)) return
    setSelectedIndex(index)

    const clickedQuiz = quizData[index]
    const isCorrect = clickedQuiz.QuizNo === currentQuizIndex

    const afterFeedback = () => {
      if (isCorrect) {
        setCorrectIndices((prev) => new Set(prev).add(index))
        const nextQuizNo = currentQuizIndex + 1
        const hasNext = quizData.some((quiz) => quiz.QuizNo === nextQuizNo)
        if (hasNext) {
          setCurrentQuizIndex(nextQuizNo)
        } else {
          onComplete()
        }
      }
      setSelectedIndex(null)
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isCorrect, afterFeedback)
    } else {
      afterFeedback()
    }
  }

  return (
    <>
      <QuestionSoundButton
        soundUrl={
          quizData.find((quiz) => quiz.QuizNo === currentQuizIndex)?.Question
            ?.Sound || ''
        }
        autoPlay={true}
      />

      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY1)}
        </QuizComment>
        <ListeningActivity1CardsSection
          quizData={quizData}
          selectedIndex={selectedIndex}
          currentQuizNo={currentQuizIndex}
          solvedIndices={correctIndices}
          onCardClick={handleCardClick}
        />
      </QuizBody>
    </>
  )
}
