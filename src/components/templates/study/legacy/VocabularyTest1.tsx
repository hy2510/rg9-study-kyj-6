import { useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { OptionCardsRow } from '@components/atoms/study/cards/OptionCardsRow'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameVocabularyWide from '@components/molecules/study/question/images/QuestionImageFrameVocabularyWide'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import { useVocabularyTest1View } from '@hooks/study/legacy/useVocabularyTest1View'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IVocabulary1Test } from '@src/interfaces/study/IVocabulary'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { pendingQuizTryCount } from '@src/utils/study/legacy/pendingQuizTryCount'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function VocabularyTest1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IVocabulary1Test | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  } = useVocabularyTest1View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const studentAnswer = useStudentAnswer(studyInfo.mode)
  const { playAudio, stopAudio } = useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [tryCount, setTryCount] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
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
    setImageLoaded(false)
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null

  if (!isReady || !currentMeta) return <CenteredLoading />

  const shuffledExamples = currentMeta?.examples ?? []

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

  const proceedAfterAnswer = (isCorrect: boolean, newTryCount: number) => {
    const willAdvance = isCorrect || newTryCount >= quizAnswerCount

    const cb = () => {
      if (willAdvance) {
        advanceToNext()
      } else {
        setSelectedText(null)
        setTryCount(newTryCount)
        isWorking.current = false
      }
    }

    if (currentMeta.sound) {
      playAudio(currentMeta.sound, cb)
    } else {
      cb()
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
      quizFeedback.presentResult(isCorrect, () =>
        proceedAfterAnswer(isCorrect, newTryCount),
      )
    } else {
      proceedAfterAnswer(isCorrect, newTryCount)
    }
  }

  return (
    <QuizBody>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.VOCABULARY_TEST1)}</QuizComment>

      <QuestionImageFrameVocabularyWide>
        {!imageLoaded && <CardImageSkeleton />}
        <img
          src={currentMeta.image}
          alt=''
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </QuestionImageFrameVocabularyWide>

      <OptionCardsRow $direction='row' $mobileDirection='column'>
        {shuffledExamples.map((opt, index) => (
          <GridQuizOptionCardBox
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
            onClick={() => handleCardClick(index)}
          >
            <TextBox fontSize={1.5} fontWeight={600} color='primary'>
              <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
            </TextBox>
          </GridQuizOptionCardBox>
        ))}
      </OptionCardsRow>
    </QuizBody>
  )
}
