import { media } from '@styles/tokens/breakpoints'
import { styled } from 'styled-components'

import QuizContainerStatusHeader from '@components/molecules/study/layout/QuizContainerStatusHeader'
import ListeningActivity1 from '@components/templates/study/remix/activities/listening-activity/ListeningActivity1'
import ListeningActivity2 from '@components/templates/study/remix/activities/listening-activity/ListeningActivity2'
import Summary1 from '@components/templates/study/remix/activities/summary/Summary1'
import Summary2 from '@components/templates/study/remix/activities/summary/Summary2'
import TrueOrFalse from '@components/templates/study/remix/activities/true-or-false/TrueOrFalse'
import { QuizActivityEnter } from '@components/templates/study/remix/features/renderActivity'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { QuizDataWithActivityType } from '@hooks/study/remix/useQuizManager'
import { QuizInfo } from '@interfaces/study/remix/QuizInfo'

type QuizAct1Props = {
  quizInfo: QuizInfo
  act1Data: QuizDataWithActivityType[]
  setQuizInfo: (quizInfo: QuizInfo) => void
  setIsAugmentOpen: (isOpen: boolean) => void
}

export default function QuizAct1({
  quizInfo,
  act1Data,
  setQuizInfo,
  setIsAugmentOpen,
}: QuizAct1Props) {
  const quizFeedback = useQuizFeedbackOptional()

  const currentStage = quizInfo.stage || 0
  const currentItem = act1Data[currentStage]
  const activityType = currentItem?.activityType
  const currentQuizData = currentItem?.data.Quiz

  // 완료 핸들러: Summary나 TrueOrFalse 완료 시 Augment 띄우기
  const handleComplete = () => {
    const advance = () => {
      if (currentStage === act1Data.length - 1) {
        setIsAugmentOpen(true)
      } else if (currentStage < act1Data.length - 1) {
        setQuizInfo({
          ...quizInfo,
          stage: currentStage + 1,
          round: 0,
        })
      }
    }
    if (quizFeedback) {
      quizFeedback.presentResult(true, advance)
    } else {
      advance()
    }
  }

  // activityType에 따라 다른 컴포넌트 렌더링
  const renderQuizComponent = () => {
    if (!activityType || !currentQuizData) {
      return <div>데이터가 없습니다.</div>
    }

    switch (activityType) {
      case 'Summary1':
        return (
          <Summary1 quizData={currentQuizData} onComplete={handleComplete} />
        )
      case 'Summary2':
        return (
          <Summary2 quizData={currentQuizData} onComplete={handleComplete} />
        )
      case 'TrueOrFalse':
        return (
          <TrueOrFalse quizData={currentQuizData} onComplete={handleComplete} />
        )
      case 'ListeningActivity1':
        return (
          <ListeningActivity1
            quizData={currentQuizData}
            onComplete={handleComplete}
          />
        )
      case 'ListeningActivity2':
        return (
          <ListeningActivity2
            quizData={currentQuizData}
            onComplete={handleComplete}
          />
        )
      default:
        return <div>알 수 없는 액티비티 타입: {activityType}</div>
    }
  }

  return (
    <QuizAct1Wrapper>
      {activityType && currentQuizData ? (
        <QuizAct1Content>
          <QuizContainerStatusHeader />
          <QuizActivityEnter key={activityType}>
            {renderQuizComponent()}
          </QuizActivityEnter>
        </QuizAct1Content>
      ) : (
        <div>데이터가 없습니다.</div>
      )}
    </QuizAct1Wrapper>
  )
}

const QuizAct1Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  ${media.mobile} {
    padding: 0 8px;
  }
`

const QuizAct1Content = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 900px;
  min-height: 300px;
  background-color: rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-sizing: border-box;

  ${media.tablet} {
    min-width: 0;
    border-width: 2px;
    border-radius: 28px;
  }

  ${media.mobile} {
    border-radius: 24px;
  }
`
