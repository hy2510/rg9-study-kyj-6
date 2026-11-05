import { useContext, useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import TwoColumnCardsSection from '@components/molecules/study/layout/TwoColumnCardsSection'
import {
  NextQuestionButton,
  NextQuestionButtonWrap,
} from '@components/molecules/study/question/NextQuestionButton'
import QuestionContentRow from '@components/molecules/study/question/QuestionContentRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { BlockTextQuizCardBox } from '@components/molecules/study/quizOptions/cards/BlockTextQuizCardBox'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { isObserverMode } from '@src/utils/study/reviewMode'

type TrueOrFalseProps = {
  quizData: BaseQuiz[]
  onComplete: () => void
}

function getIsCorrectAnswer(quiz: BaseQuiz): boolean {
  if (quiz.Examples[0].Text === quiz.Question.Text) {
    return true
  } else {
    return false
  }
}

export default function TrueOrFalse({
  quizData,
  onComplete,
}: TrueOrFalseProps) {
  const { t } = useTranslation()
  const { studyInfo } = useContext(AppContext) as AppContextProps
  const isStaff = isObserverMode(studyInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [showTrueSentence, setShowTrueSentence] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentQuiz = quizData[currentQuizIndex]
  const isCorrectAnswer = getIsCorrectAnswer(currentQuiz)
  const correctAnswerIndex = isCorrectAnswer ? 0 : 1 // 0: True, 1: False

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // 문제 인덱스가 바뀌면 다음 문제에서 다시 선택할 수 있도록 UI 상태를 리셋
  useEffect(() => {
    audioRef.current?.pause()
    audioRef.current = null
    if (isStaff) {
      const quiz = quizData[currentQuizIndex]
      const correctIdx = getIsCorrectAnswer(quiz) ? 0 : 1
      setSelectedIndex(correctIdx)
      setShowTrueSentence(correctIdx !== 0)
      setIsPlaying(false)
    } else {
      setSelectedIndex(null)
      setShowTrueSentence(false)
      setIsPlaying(false)
    }
  }, [currentQuizIndex, isStaff])

  const goNextImmediate = () => {
    if (currentQuizIndex >= quizData.length - 1) {
      onComplete()
      return
    }
    setCurrentQuizIndex((prev) => prev + 1)
  }

  /** 레거시(피드백 Provider 없음) */
  const goNext = () => {
    if (currentQuizIndex >= quizData.length - 1) {
      onComplete()
      return
    }
    setCurrentQuizIndex((prev) => prev + 1)
  }

  const handleCardClick = (selectIndex: number) => {
    if (selectedIndex !== null) return
    setSelectedIndex(selectIndex)

    const isCorrect = selectIndex === correctAnswerIndex

    // 요구한 최종 로직(4케이스):
    // 1) 문장 정답(True)인데 True를 고르면: True 초록, 다음 문제로
    // 2) 문장 정답(True)인데 False를 고르면: False 빨강, showTrueSentence
    // 3) 문장 오답(False)인데 True를 고르면: True 빨강, showTrueSentence
    // 4) 문장 오답(False)인데 False를 고르면: False 초록, showTrueSentence
    if (isCorrect && correctAnswerIndex === 0) {
      if (quizFeedback) {
        quizFeedback.presentResult(true, goNextImmediate)
      } else {
        goNext()
      }
      return
    }

    setShowTrueSentence(true)
    if (quizFeedback) {
      quizFeedback.presentResult(false, goNextImmediate)
    }
  }

  const handleTrueSentenceSound = () => {
    if (!currentQuiz?.Examples?.[0]?.Sound) return

    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(currentQuiz.Examples[0].Sound)
    audioRef.current = audio
    audio.volume = 0.7
    audio.addEventListener('ended', () => {
      audioRef.current = null
      setIsPlaying(false)
    })
    audio.play().catch((err) => {
      console.error('True sentence audio play failed:', err)
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }

  const options = ['True', 'False']

  return (
    <>
      <QuestionSoundButton
        soundUrl={currentQuiz.Question.Sound}
        autoPlay={true}
      />

      <QuizBody>
        <QuestionContentRow>
          <TextBox fontSize={1.5} fontWeight={800} color='#fff'>
            <span
              dangerouslySetInnerHTML={{ __html: currentQuiz.Question.Text }}
            />
          </TextBox>
        </QuestionContentRow>

        <TwoColumnCardsSection>
          {options.map((text, index) => (
            <BlockTextQuizCardBox
              key={index}
              $pressed={selectedIndex === index}
              $isCorrect={
                selectedIndex === index && index === correctAnswerIndex
              }
              $isIncorrect={
                selectedIndex === index && index !== correctAnswerIndex
              }
              onClick={() => handleCardClick(index)}
            >
              <TextBox fontSize={1.2} fontWeight={600} color='primary'>
                <span dangerouslySetInnerHTML={{ __html: text }} />
              </TextBox>
            </BlockTextQuizCardBox>
          ))}
        </TwoColumnCardsSection>

        {showTrueSentence && currentQuiz.Examples[0] && (
          <TrueSentenceSectionBox>
            <span className='label'>True sentence</span>
            <div className='content'>
              <button
                type='button'
                tabIndex={-1}
                className='play-btn'
                onClick={handleTrueSentenceSound}
                disabled={!currentQuiz.Examples[0].Sound}
                aria-label={isPlaying ? '정지' : '재생'}
              >
                {isPlaying ? (
                  <IconSoundStop width={32} height={32} />
                ) : (
                  <IconSoundPlay width={32} height={32} />
                )}
              </button>
              <TextBox fontSize={1.1} fontWeight={600} color='#fff'>
                <span
                  dangerouslySetInnerHTML={{
                    __html: currentQuiz.Examples[0].Text,
                  }}
                />
              </TextBox>
            </div>

            {!quizFeedback ? (
              <NextQuestionButtonWrap>
                <NextQuestionButton
                  type='button'
                  tabIndex={-1}
                  onClick={goNext}
                >
                  {t('study.nextQuestion')}
                </NextQuestionButton>
              </NextQuestionButtonWrap>
            ) : null}
          </TrueSentenceSectionBox>
        )}
      </QuizBody>
    </>
  )
}

const TrueSentenceSectionBox = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-size: 0.95em;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
  }

  .content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .play-btn {
    flex-shrink: 0;
    cursor: pointer;
    width: 40px;
    height: 40px;
    padding: 8px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.05s ease;

    &:active:not(:disabled) {
      transform: translateY(1px);
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }

    img {
      display: block;
    }
  }
`
