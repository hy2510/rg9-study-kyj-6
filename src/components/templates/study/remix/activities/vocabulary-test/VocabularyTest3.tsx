import { useEffect, useMemo, useRef, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import { IconSpeaker } from '@components/atoms/common/icons/IconSpeaker'
import TextBox from '@components/atoms/common/TextBox'
import { MatchingCardBox } from '@components/atoms/study/cards/MatchingCardBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { LANGUAGE_MAP } from '@src/constants/common/language'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

const REF = (window as any).REF
const lang = REF?.language || 'ko'

type VocabularyMatchingProps = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz[]
  onComplete: (isCorrect: boolean) => void
}

type MatchPair = {
  koreanId: string
  englishId: string
}

/** 왼쪽 카드 내부 (ReadingComprehension3 패턴: 단일 audioRef로 재생 제어, 동시 재생 방지) */
function VocabularyMatchingLeftCardContent({
  displayType,
  text,
  isPlaying,
  textColor,
}: {
  displayType: keyof typeof LANGUAGE_MAP | 'Sound'
  text: string
  isPlaying: boolean
  textColor: string
}) {
  if (displayType === 'Sound') {
    return (
      <LeftCardSoundContent>
        <SoundIconWrapper aria-hidden>
          {isPlaying ? (
            <IconSoundStop width={32} height={32} />
          ) : (
            <IconSpeaker width={32} height={32} />
          )}
        </SoundIconWrapper>
      </LeftCardSoundContent>
    )
  }
  return (
    <TextBox fontSize={1.5} fontWeight={600} color={textColor}>
      {text}
    </TextBox>
  )
}

export default function VocabularyMatching({
  augmentOptions,
  quizData,
  onComplete,
}: VocabularyMatchingProps) {
  const { t } = useTranslation()
  const quizFeedback = useQuizFeedbackOptional()
  // 한글 카드 선택 상태
  const [selectedKoreanId, setSelectedKoreanId] = useState<string | null>(null)
  // 매칭된 쌍들
  const [matchedPairs, setMatchedPairs] = useState<MatchPair[]>([])
  // 오답 피드백: 잘못 선택한 English QuizId
  const [incorrectEnglishId, setIncorrectEnglishId] = useState<string | null>(
    null,
  )
  // 오답 피드백: 잘못 매칭 시 선택된 한글 카드 QuizId (왼쪽 카드 빨간색 표시)
  const [incorrectKoreanId, setIncorrectKoreanId] = useState<string | null>(
    null,
  )
  // 선택 비활성화 상태
  const [isCheckingMatch, setIsCheckingMatch] = useState<boolean>(false)
  // 오디오 재생 (ReadingComprehension3 패턴: 단일 audioRef로 동시 재생 방지)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingQuizId, setPlayingQuizId] = useState<string | null>(null)
  // 매칭 후 1초 지난 카드 (회색으로 표시)
  const [grayedMatchedIds, setGrayedMatchedIds] = useState<Set<string>>(
    () => new Set(),
  )
  const prevMatchedCountRef = useRef(0)

  const leftCardDisplayType = useMemo<
    keyof typeof LANGUAGE_MAP | 'Sound'
  >(() => {
    return Math.random() < 0.5 ? LANGUAGE_MAP[lang] : 'Sound'
  }, [])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const handlePlaySound = (soundUrl: string, quizId: string) => {
    if (playingQuizId === quizId) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingQuizId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (soundUrl) {
      const audio = new Audio(soundUrl)
      audioRef.current = audio
      audio.addEventListener('ended', () => {
        audioRef.current = null
        setPlayingQuizId(null)
      })
      audio.play().catch((err) => {
        console.error('Audio play failed:', err)
        setPlayingQuizId(null)
      })
      setPlayingQuizId(quizId)
    }
  }

  // 매칭 시 1초 후 회색으로 전환
  useEffect(() => {
    if (matchedPairs.length > prevMatchedCountRef.current) {
      const lastPair = matchedPairs[matchedPairs.length - 1]
      const timer = setTimeout(() => {
        setGrayedMatchedIds(
          (prev) => new Set([...prev, lastPair.koreanId, lastPair.englishId]),
        )
      }, 1000)
      prevMatchedCountRef.current = matchedPairs.length
      return () => clearTimeout(timer)
    }
    if (matchedPairs.length < prevMatchedCountRef.current) {
      prevMatchedCountRef.current = matchedPairs.length
      setGrayedMatchedIds(new Set())
    }
  }, [matchedPairs])

  // 한글 단어 리스트 (무작위로 섞기)
  const leftCards = useMemo(() => {
    return shuffle([...quizData])
  }, [quizData])

  // 영어 단어 리스트 (무작위로 섞기)
  const rightCards = useMemo(() => {
    return shuffle([...quizData])
  }, [quizData])

  // 매칭된 카드 제외
  const availableKoreanCards = useMemo(() => {
    const matchedKoreanIds = new Set(matchedPairs.map((p) => p.koreanId))
    return leftCards.filter((card) => !matchedKoreanIds.has(card.QuizId))
  }, [leftCards, matchedPairs])

  const availableEnglishCards = useMemo(() => {
    const matchedEnglishIds = new Set(matchedPairs.map((p) => p.englishId))
    return rightCards.filter((card) => !matchedEnglishIds.has(card.QuizId))
  }, [rightCards, matchedPairs])

  // 한글 카드 클릭 핸들러
  const handleKoreanClick = (quizId: string) => {
    if (isCheckingMatch) return

    // 이미 매칭된 카드는 클릭 불가
    if (matchedPairs.some((p) => p.koreanId === quizId)) return

    // 이미 선택된 카드를 다시 클릭하면 선택 해제
    if (selectedKoreanId === quizId) {
      setSelectedKoreanId(null)
      return
    }

    setSelectedKoreanId(quizId)
    setIncorrectEnglishId(null)
    setIncorrectKoreanId(null)
  }

  // 영어 카드 클릭 핸들러
  const handleEnglishClick = (englishQuizId: string) => {
    if (isCheckingMatch) return

    // 이미 매칭된 카드는 클릭 불가
    if (matchedPairs.some((p) => p.englishId === englishQuizId)) return

    // 한글 카드가 선택되지 않았으면 클릭 무시
    if (!selectedKoreanId) return

    setIsCheckingMatch(true)

    // 정답 확인: 선택된 한글 카드와 영어 카드가 같은 QuizNo인지 확인
    const selectedKoreanCard = leftCards.find(
      (card) => card.QuizId === selectedKoreanId,
    )
    const clickedEnglishCard = rightCards.find(
      (card) => card.QuizId === englishQuizId,
    )

    if (
      selectedKoreanCard &&
      clickedEnglishCard &&
      selectedKoreanCard.QuizNo === clickedEnglishCard.QuizNo
    ) {
      // 정답: 매칭된 쌍 추가
      setMatchedPairs([
        ...matchedPairs,
        {
          koreanId: selectedKoreanId,
          englishId: englishQuizId,
        },
      ])
      setSelectedKoreanId(null)
      setIncorrectEnglishId(null)
      setIncorrectKoreanId(null)

      if (matchedPairs.length + 1 === quizData.length) {
        setIsCheckingMatch(false)
        onComplete(true)
      } else if (quizFeedback) {
        quizFeedback.presentResult(true, () => setIsCheckingMatch(false))
      } else {
        setIsCheckingMatch(false)
      }
    } else {
      setIncorrectEnglishId(englishQuizId)
      setIncorrectKoreanId(selectedKoreanId)
      setSelectedKoreanId(null)
      const clearWrong = () => {
        setIncorrectEnglishId(null)
        setIncorrectKoreanId(null)
        setIsCheckingMatch(false)
      }
      if (quizFeedback) {
        quizFeedback.presentResult(false, clearWrong)
      } else {
        clearWrong()
      }
    }
  }

  const getQuestion = (
    quizId: string,
    type: keyof typeof LANGUAGE_MAP | 'Sound' | 'Text',
  ): string => {
    const quiz = quizData.find((q) => q.QuizId === quizId)
    return (quiz?.Question as Record<string, string>)?.[type as string] ?? ''
  }

  // 카드가 매칭되었는지 확인
  const isMatched = (quizId: string, type: 'korean' | 'english'): boolean => {
    if (type === 'korean') {
      return matchedPairs.some((p) => p.koreanId === quizId)
    } else {
      return matchedPairs.some((p) => p.englishId === quizId)
    }
  }

  const handleLeftMatchingCardClick = (quizId: string) => {
    handleKoreanClick(quizId)
    if (leftCardDisplayType === 'Sound') {
      handlePlaySound(getQuestion(quizId, 'Sound'), quizId)
    }
  }

  return (
    <QuizBody>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.MATCHING_CARDS)}</QuizComment>
      <VocabularyMatchingContainer>
        {leftCards.map((leftCard, index) => {
          const rightCard = rightCards[index]
          if (!rightCard) return null

          const isSelected = selectedKoreanId === leftCard.QuizId
          const leftMatched = isMatched(leftCard.QuizId, 'korean')
          const leftIncorrect = incorrectKoreanId === leftCard.QuizId
          const leftAvailable = availableKoreanCards.some(
            (c) => c.QuizId === leftCard.QuizId,
          )
          const leftGrayed =
            leftMatched && grayedMatchedIds.has(leftCard.QuizId)
          const leftTextColor = leftMatched
            ? leftGrayed
              ? '#A2B1C4'
              : '#199261'
            : 'primary'

          const rightMatched = isMatched(rightCard.QuizId, 'english')
          const rightIncorrect = incorrectEnglishId === rightCard.QuizId
          const rightAvailable = availableEnglishCards.some(
            (c) => c.QuizId === rightCard.QuizId,
          )
          const rightGrayed =
            rightMatched && grayedMatchedIds.has(rightCard.QuizId)
          const rightTextColor = rightMatched
            ? rightGrayed
              ? '#A2B1C4'
              : '#199261'
            : 'primary'

          return (
            <MatchingCardPairRow
              key={`${leftCard.QuizId}-${rightCard.QuizId}-${index}`}
            >
              <MatchingCardBox
                onClick={() => handleLeftMatchingCardClick(leftCard.QuizId)}
                isSelected={isSelected}
                isMatched={leftMatched}
                isGrayed={leftGrayed}
                isIncorrect={leftIncorrect}
                isDisabled={!leftAvailable}
              >
                <VocabularyMatchingLeftCardContent
                  displayType={leftCardDisplayType}
                  text={getQuestion(leftCard.QuizId, leftCardDisplayType)}
                  isPlaying={playingQuizId === leftCard.QuizId}
                  textColor={leftTextColor}
                />
              </MatchingCardBox>
              <MatchingCardBox
                onClick={() => handleEnglishClick(rightCard.QuizId)}
                isMatched={rightMatched}
                isGrayed={rightGrayed}
                isIncorrect={rightIncorrect}
                isDisabled={!rightAvailable}
              >
                <TextBox fontSize={1.5} fontWeight={600} color={rightTextColor}>
                  {leftCardDisplayType === 'Sound' ? (
                    <>{getQuestion(rightCard.QuizId, LANGUAGE_MAP[lang])}</>
                  ) : (
                    <>{getQuestion(rightCard.QuizId, 'Text')}</>
                  )}
                </TextBox>
              </MatchingCardBox>
            </MatchingCardPairRow>
          )
        })}
      </VocabularyMatchingContainer>
    </QuizBody>
  )
}

const LeftCardSoundContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SoundIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`

const VocabularyMatchingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
`

/** 같은 행의 좌·우 카드 높이를 맞춤 */
const MatchingCardPairRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
  min-width: 0;
`
