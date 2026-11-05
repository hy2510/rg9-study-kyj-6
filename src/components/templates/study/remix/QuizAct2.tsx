import { useMemo } from 'react'

import { styled } from 'styled-components'

import ActivityStage from '@components/organisms/study/common/ActivityStage'
import { renderActivity } from '@components/templates/study/remix/features/renderActivity'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import {
  getAugmentOptions,
  type SelectedAugment,
} from '@hooks/study/remix/useAugmentManager'
import {
  ActivityType,
  QuizStage,
  ShuffledQuizItem,
} from '@hooks/study/remix/useQuizManager'
import { QuizInfo } from '@interfaces/study/remix/QuizInfo'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { playAudioBeforeContinue } from '@utils/audio/playAudioBeforeContinue'

type QuizAct2Props = {
  selectedAugments: SelectedAugment[]
  quizInfo: QuizInfo
  act2Data: QuizStage[]
  setQuizInfo: (quizInfo: QuizInfo) => void
  setIsAugmentOpen: (isOpen: boolean) => void
  onWrongAnswer: () => void
}

export default function QuizAct2({
  selectedAugments,
  quizInfo,
  act2Data,
  setQuizInfo,
  setIsAugmentOpen,
  onWrongAnswer,
}: QuizAct2Props) {
  const currentStage = quizInfo.stage
  const currentRound = quizInfo.round

  const currentStageData = act2Data[currentStage]
  const currentQuiz: ShuffledQuizItem | undefined =
    currentStageData?.quizzes[currentRound]

  const augmentOptions = useMemo(
    () =>
      getAugmentOptions(
        selectedAugments,
        currentQuiz?.activityType as ActivityType | undefined,
      ),
    [selectedAugments, currentQuiz?.activityType],
  )

  const quizFeedback = useQuizFeedbackOptional()

  const handleNextQuestion = (updatedQuizInfo?: QuizInfo) => {
    if (!currentStageData) return

    const quizInfoToUse = updatedQuizInfo || quizInfo

    const totalQuizzesInStage = currentStageData.quizzes.length
    const totalStages = act2Data.length

    if (currentRound < totalQuizzesInStage - 1) {
      setQuizInfo({
        ...quizInfoToUse,
        round: currentRound + 1,
      })
    } else {
      const hasIncorrectQuizzes = quizInfoToUse.incorrectQuizzes.length > 0

      if (currentStage < totalStages - 1) {
        if (hasIncorrectQuizzes) {
          setQuizInfo({
            ...quizInfoToUse,
            mode: 'Review',
          })
        } else {
          setIsAugmentOpen(true)
        }
      } else if (hasIncorrectQuizzes) {
        setQuizInfo({
          ...quizInfoToUse,
          mode: 'Review',
        })
      } else {
        console.log('모든 퀴즈 완료!')
      }
    }
  }

  const handleCompleteQuestion = (isCorrect: boolean) => {
    const advance = () => {
      let updatedIncorrectQuizzes = [...quizInfo.incorrectQuizzes]

      if (!isCorrect) {
        onWrongAnswer()
        if (currentQuiz) {
          const isAlreadyAdded = updatedIncorrectQuizzes.some(
            (item) => item.quizzes[0].QuizId === currentQuiz.quizzes[0].QuizId,
          )
          if (!isAlreadyAdded) {
            updatedIncorrectQuizzes = [...updatedIncorrectQuizzes, currentQuiz]
          }
        }
      }

      handleNextQuestion({
        ...quizInfo,
        incorrectQuizzes: updatedIncorrectQuizzes,
      })
    }

    const advanceAfterReplay = () => {
      if (currentQuiz?.activityType === ACTIVITY.WRITING_1) {
        playAudioBeforeContinue(currentQuiz.quizzes[0]?.Question.Sound, advance)
        return
      }
      advance()
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isCorrect, advanceAfterReplay)
    } else {
      advanceAfterReplay()
    }
  }

  const renderCurrentQuiz = () => {
    if (!currentQuiz) {
      return <EmptyState>문제를 불러올 수 없습니다.</EmptyState>
    }

    return renderActivity({
      currentQuiz,
      augmentOptions,
      onComplete: handleCompleteQuestion,
      renderFallback: (activityType) => (
        <div>알 수 없는 액티비티 타입: {activityType}</div>
      ),
    })
  }

  if (act2Data.length === 0) {
    return (
      <ActivityStage>
        <EmptyState>퀴즈 데이터가 없습니다.</EmptyState>
      </ActivityStage>
    )
  }

  return (
    <ActivityStage
      extras={
        currentQuiz ? (
          <ActivityTypeBadge>{currentQuiz.activityType}</ActivityTypeBadge>
        ) : null
      }
    >
      {renderCurrentQuiz()}
    </ActivityStage>
  )
}

const ActivityTypeBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
  position: fixed;
  bottom: 0;
  right: 0;
`

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 18px;
  color: #666;
`
