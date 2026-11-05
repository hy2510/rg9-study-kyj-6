import { useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  ClozeTest1BlankSlot,
  ClozeTest1SentenceText,
} from '@components/molecules/study/activities/cloze-test-01/ClozeTest1Slots'
import TwoColumnCards from '@components/molecules/study/layout/TwoColumnCards'
import QuestionContentRow from '@components/molecules/study/question/QuestionContentRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useClozeTest1View } from '@hooks/study/legacy/useClozeTest1View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IClozeTest1 } from '@src/interfaces/study/IClozeTest'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'
export default function ClozeTest1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IClozeTest1 | undefined
  const recordedData = props.recordedData ?? []

  const { isReady, totalQuiz, quizAnswerCount, startQuizNo, getQuizMeta } =
    useClozeTest1View({
      quizData,
      recordedData,
      studyMode: studyInfo.mode,
    })

  const studentAnswer = useStudentAnswer(studyInfo.mode)

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [tryCount, setTryCount] = useState<number>(0)
  const isWorking = useRef<boolean>(true)

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(startQuizNo)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    isWorking.current = false
  }, [isReady])

  useEffect(() => {
    if (!isReady) return
    setSelectedText(null)
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null
  const shuffledExamples = currentMeta?.examples ?? []

  if (!isReady || !currentMeta) return <CenteredLoading />

  const advanceToNext = () => {
    setSelectedText(null)
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      setCurrentQuizIndex(nextQuizNo)
      setTryCount(0)
      heart.setCurrent(quizAnswerCount)
    } else {
      props.onFinishActivity()
    }
  }

  const enterPostAnswerFlow = () => {
    advanceToNext()
  }

  const enterRetryFlow = (newTryCount: number) => {
    setSelectedText(null)
    setTryCount(newTryCount)
    isWorking.current = false
  }

  const proceedAfterAnswer = (isCorrect: boolean, newTryCount: number) => {
    if (isCorrect || newTryCount >= quizAnswerCount) {
      enterPostAnswerFlow()
    } else {
      enterRetryFlow(newTryCount)
    }
  }

  const handleCardClick = async (clickedIndex: number) => {
    if (isWorking.current) return
    const picked = shuffledExamples[clickedIndex]
    if (!picked) return

    isWorking.current = true
    setSelectedText(picked.Text)

    const isCorrect = picked.Text === currentMeta.correctText
    const newTryCount = tryCount + 1

    const answerData: IScoreBoardData = {
      quizNo: currentMeta.quizNo,
      maxCount: quizAnswerCount,
      answerCount: newTryCount,
      ox: isCorrect,
    }

    const userAnswer = studentAnswer.makeUserAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: currentMeta.quizId,
      quizNo: currentMeta.quizNo,
      currentQuizNo: currentMeta.quizNo,
      correct: currentMeta.correctText,
      selectedAnswer: picked.Text,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect,
      answerData,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswer(studyInfo.mode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) {
        isWorking.current = false
        setSelectedText(null)
        return
      }
    } catch {
      isWorking.current = false
      setSelectedText(null)
      return
    }

    studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${currentMeta.quizId}`,
      QuizNo: currentMeta.quizNo,
      CurrentQuizNo: currentMeta.quizNo,
      OX: isCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: currentMeta.correctText,
      StudentAnswer: picked.Text,
      AnswerCount: newTryCount,
    }
    props.onUpdateRecord?.(tempRecord)
    if (!isCorrect) {
      heart.decrease()
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isCorrect, () =>
        proceedAfterAnswer(isCorrect, newTryCount),
      )
    } else {
      proceedAfterAnswer(isCorrect, newTryCount)
    }
  }

  /**
   * 빈칸이 포함된 문장 렌더링 — 첫 번째 빈칸만 입력 슬롯, 나머지는 빈 슬롯.
   */
  const sentenceParts = currentMeta.sentence.split('┒')
  const hasSelection = selectedText !== null
  const isCorrectSelection =
    hasSelection && selectedText === currentMeta.correctText
  const blankContent = hasSelection
    ? isCorrectSelection
      ? selectedText
      : currentMeta.correctText
    : '\u00A0'

  const renderSentenceWithBlanks = () => (
    <ClozeTest1SentenceText>
      {sentenceParts.map((part, i) => (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: part }} />
          {i < sentenceParts.length - 1 && (
            <ClozeTest1BlankSlot $filled={hasSelection}>
              {hasSelection ? (
                <span dangerouslySetInnerHTML={{ __html: blankContent }} />
              ) : (
                blankContent
              )}
            </ClozeTest1BlankSlot>
          )}
        </span>
      ))}
    </ClozeTest1SentenceText>
  )

  return (
    <>
      <QuestionSoundButton
        soundUrl={currentMeta.sound}
        autoPlay
        replayKey={`${currentQuizIndex}-${tryCount}`}
      />

      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.CLOZE_TEST1)}</QuizComment>
        <QuestionContentRow>
          <TextBox fontSize={1.2} fontWeight={800} color='primary'>
            {renderSentenceWithBlanks()}
          </TextBox>
        </QuestionContentRow>
        <TwoColumnCards>
          {shuffledExamples.map((opt, index) => (
            <ClozeOptionCard
              key={`${currentMeta.quizId}-${opt.Text}`}
              $pressed={selectedText !== null && selectedText === opt.Text}
              $isCorrect={
                (isReviewPass && opt.Text === currentMeta.correctText) ||
                (selectedText !== null &&
                  selectedText === opt.Text &&
                  opt.Text === currentMeta.correctText)
              }
              $isIncorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text !== currentMeta.correctText
              }
              $isInGrid={true}
              onClick={() => handleCardClick(index)}
            >
              <TextBox fontSize={1.2} fontWeight={600} color='primary'>
                <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
              </TextBox>
            </ClozeOptionCard>
          ))}
        </TwoColumnCards>
      </QuizBody>
    </>
  )
}

const ClozeOptionCard = styled(GridQuizOptionCardBox)`
  width: 100%;
`
