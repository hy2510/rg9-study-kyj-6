import { useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import SelectionCardsColumn from '@components/molecules/study/layout/SelectionCardsColumn'
import QuestionContentRow from '@components/molecules/study/question/QuestionContentRow'
import { BlockTextQuizCardBox } from '@components/molecules/study/quizOptions/cards/BlockTextQuizCardBox'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useReadingComprehension4View } from '@hooks/study/legacy/useReadingComprehension4View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IReadingComprehension4 } from '@src/interfaces/study/IReadingComprehension'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function ReadingComprehension4(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IReadingComprehension4 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    isHideQuestionText,
    getQuizMeta,
  } = useReadingComprehension4View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const studentAnswer = useStudentAnswer(studyInfo.mode)
  const { playAudio, stopAudio } = useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const isWorking = useRef<boolean>(true)

  /**
   * 7th 정책과 동일:
   * - bookType === 'PB' 인 경우 항상 문제 음원 자동 재생
   * - bookType === 'EB' 인 경우 BookLevel 이 '1' 을 포함하면 재생 (1, 1a, 1b, ...)
   */
  const shouldAutoPlayQuestionSound =
    studyInfo.bookType === 'PB' ||
    (bookInfo.BookLevel?.includes('1') ?? false)

  useEffect(() => {
    if (!isReady) return
    if (startQuizNo > totalQuiz) {
      props.onFinishActivity()
      return
    }
    setCurrentQuizIndex(startQuizNo)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount)
    isWorking.current = false
  }, [isReady])

  useEffect(() => {
    if (!isReady) return
    setSelectedText(null)
    isWorking.current = false
    if (!shouldAutoPlayQuestionSound) return
    const meta = getQuizMeta(currentQuizIndex)
    const src = meta?.sound?.trim()
    if (src) playAudio(src)
  }, [currentQuizIndex, isReady])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null

  if (!isReady || !currentMeta) return <CenteredLoading />

  const shuffledExamples = currentMeta?.examples ?? []

  const proceedAfterAnswer = () => {
    setSelectedText(null)
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      setCurrentQuizIndex(nextQuizNo)
      heart.setCurrent(quizAnswerCount)
    } else {
      props.onFinishActivity()
    }
  }

  const handleCardClick = async (clickedIndex: number) => {
    if (isWorking.current) return
    const picked = shuffledExamples[clickedIndex]
    if (!picked) return

    isWorking.current = true
    stopAudio()
    setSelectedText(picked.Text)

    const isCorrect = picked.Text === currentMeta.correctText
    const newTryCount = 1

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
      // 재시험(RC4) 모드일 때 7th 정책과 동일하게 step='R' 로 서버 전송해 재시험 결과로 마킹
      step: props.isRetest ? 'R' : props.currentStep,
      quizId: currentMeta.quizId,
      quizNo: currentMeta.quizNo,
      currentQuizNo: currentQuizIndex,
      correct: currentMeta.correctText,
      selectedAnswer: picked.Text,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect,
      answerData,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    const isLastQuestion = currentQuizIndex >= totalQuiz

    try {
      const res = await saveUserAnswer(studyInfo.mode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0 && !isLastQuestion) {
        isWorking.current = false
        setSelectedText(null)
        return
      }
    } catch {
      if (!isLastQuestion) {
        isWorking.current = false
        setSelectedText(null)
        return
      }
    }

    studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${currentMeta.quizId}`,
      QuizNo: currentMeta.quizNo,
      CurrentQuizNo: currentQuizIndex,
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
      quizFeedback.presentResult(isCorrect, () => proceedAfterAnswer())
    } else {
      proceedAfterAnswer()
    }
  }

  return (
    <QuizBody>
      <QuizComment>
        {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION4)}
      </QuizComment>

      {!isHideQuestionText && (
        <QuestionContentRow>
          <TextBox fontSize={1.5} fontWeight={800}>
            <span
              dangerouslySetInnerHTML={{ __html: currentMeta.questionText }}
            />
          </TextBox>
        </QuestionContentRow>
      )}

      <SelectionCardsColumn>
        {shuffledExamples.map((opt, index) => (
          <BlockTextQuizCardBox
            key={`${currentMeta.quizId}-${opt.Text}`}
            $pressed={selectedText !== null && selectedText === opt.Text}
            $isCorrect={
              (isReviewPass && opt.Text === currentMeta.correctText) ||
              (selectedText !== null &&
                opt.Text === selectedText &&
                selectedText === currentMeta.correctText)
            }
            $isIncorrect={
              selectedText !== null &&
              opt.Text === selectedText &&
              selectedText !== currentMeta.correctText
            }
            onClick={() => handleCardClick(index)}
          >
            <TextBox fontSize={1.2} fontWeight={600} color='primary'>
              <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
            </TextBox>
          </BlockTextQuizCardBox>
        ))}
      </SelectionCardsColumn>
    </QuizBody>
  )
}
