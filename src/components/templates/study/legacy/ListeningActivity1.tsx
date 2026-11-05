import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import ListeningActivity1CardsSection from '@components/organisms/study/sections/ListeningActivity1CardsSection'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useListeningActivity1View } from '@hooks/study/legacy/useListeningActivity1View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IListeningActivity1 } from '@src/interfaces/study/IListeningActivity'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { pendingQuizTryCount } from '@src/utils/study/legacy/pendingQuizTryCount'

export default function ListeningActivity1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo } = useContext(AppContext) as AppContextProps
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IListeningActivity1 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    cards,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    initialSolvedQuizNos,
    getQuizMeta,
  } = useListeningActivity1View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const studentAnswer = useStudentAnswer(studyInfo.mode)

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [solvedQuizNos, setSolvedQuizNos] = useState<Set<number>>(new Set())
  const [tryCount, setTryCount] = useState<number>(0)
  const isWorking = useRef<boolean>(true)

  useEffect(() => {
    if (!isReady) return
    if (startQuizNo > totalQuiz) {
      props.onFinishActivity()
      return
    }
    setCurrentQuizIndex(startQuizNo)
    setSolvedQuizNos(new Set(initialSolvedQuizNos))
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
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const solvedIndices = useMemo<Set<number>>(() => {
    const set = new Set<number>()
    cards.forEach((c, i) => {
      if (solvedQuizNos.has(c.QuizNo)) set.add(i)
    })
    return set
  }, [cards, solvedQuizNos])

  if (!isReady) return <CenteredLoading />

  const proceedAfterAnswer = (clickedQuizNo: number, isCorrect: boolean) => {
    const newTryCount = tryCount + 1

    if (isCorrect) {
      setSolvedQuizNos((prev) => new Set(prev).add(clickedQuizNo))
    }
    setSelectedIndex(null)

    const shouldAdvance = isCorrect || newTryCount >= quizAnswerCount
    if (shouldAdvance) {
      const nextQuizNo = currentQuizIndex + 1
      if (nextQuizNo <= totalQuiz) {
        setCurrentQuizIndex(nextQuizNo)
        setTryCount(0)
        heart.setCurrent(quizAnswerCount)
      } else {
        props.onFinishActivity()
      }
    } else {
      setTryCount(newTryCount)
      isWorking.current = false
    }
  }

  const handleCardClick = async (index: number) => {
    if (isWorking.current) return
    const clickedCard = cards[index]
    if (!clickedCard) return
    if (solvedQuizNos.has(clickedCard.QuizNo)) return

    isWorking.current = true
    setSelectedIndex(index)

    const meta = getQuizMeta(currentQuizIndex)
    if (!meta) {
      isWorking.current = false
      setSelectedIndex(null)
      return
    }

    const isCorrect = clickedCard.QuizNo === meta.quizNo
    const newTryCount = tryCount + 1

    const answerData: IScoreBoardData = {
      quizNo: meta.quizNo,
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
      quizId: meta.quizId,
      quizNo: meta.quizNo,
      currentQuizNo: currentQuizIndex,
      correct: meta.correctText,
      selectedAnswer: clickedCard?.Question.Text ?? '',
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
        setSelectedIndex(null)
      }
    } catch {
      isWorking.current = false
      setSelectedIndex(null)
    }

    studentAnswer.addStudentAnswer(answerData)

    const tempRecord: IRecordAnswerType = {
      QuizId: `${meta.quizId}`,
      QuizNo: meta.quizNo,
      CurrentQuizNo: currentQuizIndex,
      OX: isCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: meta.correctText,
      StudentAnswer: clickedCard?.Question.Text ?? '',
      AnswerCount: newTryCount,
    }

    props.onUpdateRecord?.(tempRecord)

    if (!isCorrect) {
      heart.decrease()
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isCorrect, () =>
        proceedAfterAnswer(clickedCard.QuizNo, isCorrect),
      )
    } else {
      proceedAfterAnswer(clickedCard.QuizNo, isCorrect)
    }
  }

  return (
    <>
      <QuestionSoundButton
        soundUrl={getQuizMeta(currentQuizIndex)?.sound ?? ''}
        autoPlay={true}
        replayKey={`${currentQuizIndex}-${tryCount}`}
      />

      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY1)}
        </QuizComment>

        <ListeningActivity1CardsSection
          quizData={cards}
          selectedIndex={selectedIndex}
          currentQuizNo={getQuizMeta(currentQuizIndex)?.quizNo ?? -1}
          solvedIndices={solvedIndices}
          onCardClick={handleCardClick}
        />
      </QuizBody>
    </>
  )
}
