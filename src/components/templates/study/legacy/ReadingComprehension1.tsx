import { useContext, useEffect, useRef, useState } from 'react'

import { TEXT_SHADOW_SOFT } from '@styles/tokens/textShadow'
import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import { ReadingComprehension1QuestionContainer } from '@components/atoms/study/activities/reading-comprehension-01/ReadingComprehension1QuestionContainer'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import SelectionCardsRow from '@components/molecules/study/layout/SelectionCardsRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { LargeImageQuizChoiceCard } from '@components/molecules/study/quizOptions/cards/LargeImageQuizChoiceCard'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useReadingComprehension1View } from '@hooks/study/legacy/useReadingComprehension1View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IReadingComprehension1 } from '@src/interfaces/study/IReadingComprehension'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { pendingQuizTryCount } from '@src/utils/study/legacy/pendingQuizTryCount'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function ReadingComprehension1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IReadingComprehension1 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  } = useReadingComprehension1View({
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
    if (startQuizNo > totalQuiz) {
      props.onFinishActivity()
      return
    }
    setCurrentQuizIndex(startQuizNo)
    setTryCount(startTryCount)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(
      quizAnswerCount - pendingQuizTryCount(recordedData, quizAnswerCount),
    )
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

  if (!isReady || !currentMeta) return <CenteredLoading />

  const shuffledExamples = currentMeta?.examples ?? []

  const proceedAfterAnswer = (isCorrect: boolean, newTryCount: number) => {
    const shouldAdvance = isCorrect || newTryCount >= quizAnswerCount
    if (shouldAdvance) {
      setSelectedText(null)
      const nextQuizNo = currentQuizIndex + 1
      if (nextQuizNo <= totalQuiz) {
        setCurrentQuizIndex(nextQuizNo)
        setTryCount(0)
        heart.setCurrent(quizAnswerCount)
      } else {
        props.onFinishActivity()
      }
    } else {
      setSelectedText(null)
      setTryCount(newTryCount)
      isWorking.current = false
    }
  }

  const handleCardClick = async (index: number) => {
    if (isWorking.current) return
    const picked = shuffledExamples[index]
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

  return (
    <>
      <QuestionSoundButton
        soundUrl={currentMeta.sound}
        autoPlay={true}
        replayKey={`${currentQuizIndex}-${tryCount}`}
      />

      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION1)}
        </QuizComment>

        <ReadingComprehension1QuestionContainer>
          <TextBox fontSize={1.5} fontWeight={600}>
            {currentMeta.questionText}
          </TextBox>
        </ReadingComprehension1QuestionContainer>

        <SelectionCardsRow
          direction='row'
          mobileDirection='column'
          fitMobileHeight
        >
          {shuffledExamples.map((opt, index) => (
            <LargeImageQuizChoiceCard
              key={`${currentMeta.quizId}-${index}`}
              index={index}
              image={opt.Image}
              text={opt.Text}
              selectedText={selectedText}
              reserveLoadingHeight
              isCorrect={
                (isReviewPass && opt.Text === currentMeta.correctText) ||
                (selectedText !== null &&
                  selectedText === opt.Text &&
                  opt.Text === currentMeta.correctText)
              }
              isIncorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text !== currentMeta.correctText
              }
              onCardClick={() => handleCardClick(index)}
            />
          ))}
        </SelectionCardsRow>
      </QuizBody>
    </>
  )
}
