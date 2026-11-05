import { type MouseEvent, useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { ListeningActivity4Card } from '@components/molecules/study/activities/listening-activity-04/ListeningActivity4Card'
import SelectionCardsColumn from '@components/molecules/study/layout/SelectionCardsColumn'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useStudyVisibility } from '@contexts/StudyVisibilityContext'
import { useListeningActivity4View } from '@hooks/study/legacy/useListeningActivity4View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio, { PlayState } from '@hooks/study/legacy/useStudyAudio'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IListeningActivity4 } from '@src/interfaces/study/IListeningActivity'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { pendingQuizTryCount } from '@src/utils/study/legacy/pendingQuizTryCount'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

type MultiPlayState = {
  playState: PlayState
  playType: '' | 'sentence' | 'all'
  seq: number
}

const RESET_PLAY: MultiPlayState = { playState: '', playType: '', seq: -1 }

export default function ListeningActivity4(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IListeningActivity4 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  } = useListeningActivity4View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const studentAnswer = useStudentAnswer(studyInfo.mode)
  const { playAudio, stopAudio } = useStudyAudio()
  const isStudyVisible = useStudyVisibility()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [tryCount, setTryCount] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [multiPlay, setMultiPlay] = useState<MultiPlayState>(RESET_PLAY)
  const isWorking = useRef<boolean>(true)

  useEffect(() => {
    if (isStudyVisible) return
    setMultiPlay(RESET_PLAY)
  }, [isStudyVisible])

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
    setMultiPlay({ playState: 'playing', playType: 'all', seq: 0 })
  }, [isReady])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null
  const shuffledExamples = currentMeta?.examples ?? []

  useEffect(() => {
    if (!isReady) return
    setSelectedText(null)
    setImageLoaded(false)
    isWorking.current = false
    setMultiPlay({ playState: 'playing', playType: 'all', seq: 0 })
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  useEffect(() => {
    stopAudio()
    if (!isReady || multiPlay.seq < 0 || shuffledExamples.length === 0) return

    if (multiPlay.playType === 'sentence') {
      playAudio(shuffledExamples[multiPlay.seq].Sound, () => {
        setMultiPlay(RESET_PLAY)
      })
    } else if (multiPlay.playType === 'all') {
      playAudio(shuffledExamples[multiPlay.seq].Sound, () => {
        if (multiPlay.seq < shuffledExamples.length - 1) {
          setMultiPlay({
            playState: 'playing',
            playType: 'all',
            seq: multiPlay.seq + 1,
          })
        } else {
          stopAudio()
          setMultiPlay(RESET_PLAY)
        }
      })
    }
  }, [multiPlay])

  if (!isReady || !currentMeta) return <CenteredLoading />

  const showTextDirectly = !['1B', '1C'].includes(
    bookInfo.BookLevel?.trim().toUpperCase() ?? '',
  )

  const playWord = (index: number) => {
    if (multiPlay.playState === '' && index > -1) {
      setMultiPlay({ playState: 'playing', playType: 'sentence', seq: index })
    } else if (multiPlay.playState === 'playing' && multiPlay.seq === index) {
      setMultiPlay(RESET_PLAY)
    } else if (multiPlay.playState === 'playing' && multiPlay.seq !== index) {
      setMultiPlay({ playState: 'playing', playType: 'sentence', seq: index })
    }
  }

  const proceedAfterAnswer = (isCorrect: boolean) => {
    setSelectedText(null)
    const newTryCount = tryCount + 1

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

  const handleCardClick = async (clickedIndex: number) => {
    if (isWorking.current) return
    const picked = shuffledExamples[clickedIndex]
    if (!picked) return

    isWorking.current = true
    stopAudio()
    setMultiPlay(RESET_PLAY)
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
      quizFeedback.presentResult(isCorrect, () => proceedAfterAnswer(isCorrect))
    } else {
      proceedAfterAnswer(isCorrect)
    }
  }

  return (
    <QuizBody>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY4)}</QuizComment>

      <QuestionImageFrameRounded>
        {!imageLoaded && <CardImageSkeleton />}
        <img
          src={currentMeta.image}
          alt=''
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </QuestionImageFrameRounded>

      {showTextDirectly ? (
        <SelectionCardsColumn>
          {shuffledExamples.map((opt, index) => (
            <ListeningActivity4Card
              key={`${currentMeta.quizId}-${opt.Text}`}
              text={opt.Text}
              isPressed={selectedText !== null && selectedText === opt.Text}
              isCorrect={
                (isReviewPass && opt.Text === currentMeta.correctText) ||
                (selectedText !== null &&
                  opt.Text === selectedText &&
                  selectedText === currentMeta.correctText)
              }
              isIncorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText !== currentMeta.correctText
              }
              isPlaying={
                multiPlay.playState === 'playing' && multiPlay.seq === index
              }
              onCardClick={() => handleCardClick(index)}
              onSoundClick={(e: MouseEvent) => {
                e.stopPropagation()
                playWord(index)
              }}
              showTextDirectly
              hasRevealButton={false}
            />
          ))}
        </SelectionCardsColumn>
      ) : (
        <SoundOnlyRow>
          {shuffledExamples.map((opt, index) => (
            <ListeningActivity4Card
              key={`${currentMeta.quizId}-${opt.Text}`}
              text={opt.Text}
              isPressed={selectedText !== null && selectedText === opt.Text}
              isCorrect={
                (isReviewPass && opt.Text === currentMeta.correctText) ||
                (selectedText !== null &&
                  opt.Text === selectedText &&
                  selectedText === currentMeta.correctText)
              }
              isIncorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText !== currentMeta.correctText
              }
              isPlaying={
                multiPlay.playState === 'playing' && multiPlay.seq === index
              }
              onCardClick={() => handleCardClick(index)}
              onSoundClick={(e: MouseEvent) => {
                e.stopPropagation()
                playWord(index)
              }}
              showTextDirectly={false}
              hasRevealButton={false}
            />
          ))}
        </SoundOnlyRow>
      )}
    </QuizBody>
  )
}

const SoundOnlyRow = styled.div`
  display: flex;
  gap: 12px;
`
