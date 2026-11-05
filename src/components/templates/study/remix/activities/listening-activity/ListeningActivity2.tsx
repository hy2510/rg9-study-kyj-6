import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import ListeningActivity2CardsSection from '@components/organisms/study/sections/ListeningActivity2CardsSection'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ListeningActivity2Props = {
  quizData: BaseQuiz[]
  onComplete: () => void
}

export default function ListeningActivity2({
  quizData,
  onComplete,
}: ListeningActivity2Props) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [solvedQuizNos, setSolvedQuizNos] = useState<Set<number>>(new Set())

  const handleCardClick = (index: number) => {
    const clickedQuiz = quizData[index]
    if (!clickedQuiz) return
    if (selectedIndex !== null || solvedQuizNos.has(clickedQuiz.QuizNo)) return
    setSelectedIndex(index)

    const isCorrect = clickedQuiz.QuizNo === currentQuizIndex

    const afterFeedback = () => {
      if (isCorrect) {
        setSolvedQuizNos((prev) => new Set(prev).add(clickedQuiz.QuizNo))
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
          {t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY2)}
        </QuizComment>

        <ListeningActivity2CardsSection
          quizData={quizData}
          selectedIndex={selectedIndex}
          currentQuizNo={currentQuizIndex}
          solvedQuizNos={solvedQuizNos}
          onCardClick={handleCardClick}
        />
      </QuizBody>
    </>
  )
}
