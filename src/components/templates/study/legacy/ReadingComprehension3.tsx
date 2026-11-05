import { type MouseEvent, useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { QuestionSoundToggle } from '@components/atoms/study/activities/reading-comprehension-03/QuestionSoundToggle'
import { ReadingComprehension3QuestionContainer } from '@components/atoms/study/activities/reading-comprehension-03/ReadingComprehension3QuestionContainer'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import { OptionCardsColumn } from '@components/atoms/study/cards/OptionCardsColumn'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameRounded from '@components/molecules/study/question/images/QuestionImageFrameRounded'
import { SoundTextQuizRowCard } from '@components/molecules/study/quizOptions/cards/SoundTextQuizRowCard'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useReadingComprehension3View } from '@hooks/study/legacy/useReadingComprehension3View'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio, { PlayState } from '@hooks/study/legacy/useStudyAudio'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IReadingComprehension3 } from '@src/interfaces/study/IReadingComprehension'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

const QUESTION_SEQ = 4

type SinglePlayState = {
  playState: PlayState
  seq: number
}

const RESET_PLAY: SinglePlayState = { playState: '', seq: -1 }

export default function ReadingComprehension3(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IReadingComprehension3 | undefined
  const recordedData = props.recordedData ?? []

  const { isReady, totalQuiz, quizAnswerCount, startQuizNo, getQuizMeta } =
    useReadingComprehension3View({
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
  const [audio, setAudio] = useState<SinglePlayState>(RESET_PLAY)
  const isWorking = useRef<boolean>(true)

  useEffect(() => {
    if (!isReady) return
    setCurrentQuizIndex(startQuizNo)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    isWorking.current = false
    setAudio({ playState: 'playing', seq: QUESTION_SEQ })
  }, [isReady])

  const currentMeta = isReady ? getQuizMeta(currentQuizIndex) : null
  const shuffledExamples = currentMeta?.examples ?? []

  useEffect(() => {
    if (!isReady) return
    setSelectedText(null)
    setImageLoaded(false)
    isWorking.current = false
    setAudio({ playState: 'playing', seq: QUESTION_SEQ })
  }, [currentQuizIndex])

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  useEffect(() => {
    stopAudio()
    if (!isReady || audio.seq < 0 || !currentMeta) return

    const src =
      audio.seq === QUESTION_SEQ
        ? currentMeta.questionSound
        : shuffledExamples[audio.seq]?.Sound

    if (!src) {
      setAudio(RESET_PLAY)
      return
    }
    playAudio(src, () => setAudio(RESET_PLAY))
  }, [audio])

  if (!isReady || !currentMeta) return <CenteredLoading />

  const playSentence = (index: number) => {
    if (audio.playState === '' && index > -1) {
      setAudio({ playState: 'playing', seq: index })
    } else if (audio.playState === 'playing' && audio.seq === index) {
      setAudio(RESET_PLAY)
    } else if (audio.playState === 'playing' && audio.seq !== index) {
      setAudio({ playState: 'playing', seq: index })
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
    setAudio(RESET_PLAY)
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
      quizFeedback.presentResult(isCorrect, () => proceedAfterAnswer(isCorrect))
    } else {
      proceedAfterAnswer(isCorrect)
    }
  }

  const isQuestionPlaying =
    audio.playState === 'playing' && audio.seq === QUESTION_SEQ

  return (
    <QuizBody>
      <QuizComment>
        {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION3)}
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

      {(currentMeta.questionText || currentMeta.questionSound) && (
        <ReadingComprehension3QuestionContainer>
          {currentMeta.questionSound && (
            <QuestionSoundToggle
              type='button'
              aria-label={isQuestionPlaying ? '정지' : '재생'}
              onClick={() => playSentence(QUESTION_SEQ)}
            >
              {isQuestionPlaying ? (
                <IconSoundStop width={32} height={32} />
              ) : (
                <IconSoundPlay width={32} height={32} />
              )}
            </QuestionSoundToggle>
          )}
          {currentMeta.questionText && (
            <TextBox fontSize={1.5} fontWeight={600}>
              <span
                dangerouslySetInnerHTML={{ __html: currentMeta.questionText }}
              />
            </TextBox>
          )}
        </ReadingComprehension3QuestionContainer>
      )}

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
            isPlaying={audio.playState === 'playing' && audio.seq === index}
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
