import { type MouseEvent, useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { OptionCardsColumn } from '@components/atoms/study/cards/OptionCardsColumn'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import { SoundTextQuizRowCard } from '@components/molecules/study/quizOptions/cards/SoundTextQuizRowCard'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useReadingComprehension2View } from '@hooks/study/legacy/useReadingComprehension2View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio, { PlayState } from '@hooks/study/legacy/useStudyAudio'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IReadingComprehension2 } from '@src/interfaces/study/IReadingComprehension'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

type SinglePlayState = {
  playState: PlayState
  seq: number
}

const RESET_PLAY: SinglePlayState = { playState: '', seq: -1 }

export default function ReadingComprehension2(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IReadingComprehension2 | undefined
  const recordedData = props.recordedData ?? []

  const { isReady, totalQuiz, quizAnswerCount, startQuizNo, getQuizMeta } =
    useReadingComprehension2View({
      quizData,
      recordedData,
      studyMode: studyInfo.mode,
    })

  const studentAnswer = useStudentAnswer(studyInfo.mode)
  const { playAudio, stopAudio } = useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [singlePlay, setSinglePlay] = useState<SinglePlayState>(RESET_PLAY)
  const isWorking = useRef<boolean>(true)

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(startQuizNo)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    isWorking.current = false
  }, [isReady])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null
  const shuffledExamples = currentMeta?.examples ?? []

  useEffect(() => {
    if (!isReady) return
    setSelectedText(null)
    setImageLoaded(false)
    setSinglePlay(RESET_PLAY)
    isWorking.current = false
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  useEffect(() => {
    stopAudio()
    if (!isReady || singlePlay.seq < 0 || shuffledExamples.length === 0) return
    playAudio(shuffledExamples[singlePlay.seq].Sound, () => {
      setSinglePlay(RESET_PLAY)
    })
  }, [singlePlay])

  if (!isReady || !currentMeta) return <CenteredLoading />

  const playSentence = (index: number) => {
    if (singlePlay.playState === '' && index > -1) {
      setSinglePlay({ playState: 'playing', seq: index })
    } else if (singlePlay.playState === 'playing' && singlePlay.seq === index) {
      setSinglePlay(RESET_PLAY)
    } else if (singlePlay.playState === 'playing' && singlePlay.seq !== index) {
      setSinglePlay({ playState: 'playing', seq: index })
    }
  }

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
    setSinglePlay(RESET_PLAY)
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
      quizFeedback.presentResult(isCorrect, () => proceedAfterAnswer())
    } else {
      proceedAfterAnswer()
    }
  }

  return (
    <QuizBody>
      <QuizComment>
        {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION2)}
      </QuizComment>

      <QuestionImageFrameRounded>
        {!imageLoaded && <CardImageSkeleton />}
        <img
          src={currentMeta.image}
          alt=''
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      </QuestionImageFrameRounded>

      <OptionCardsColumn>
        {shuffledExamples.map((opt, index) => (
          <SoundTextQuizRowCard
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
              singlePlay.playState === 'playing' && singlePlay.seq === index
            }
            onCardClick={() => handleCardClick(index)}
            onSoundClick={(e: MouseEvent) => {
              e.stopPropagation()
              playSentence(index)
            }}
          />
        ))}
      </OptionCardsColumn>
    </QuizBody>
  )
}
