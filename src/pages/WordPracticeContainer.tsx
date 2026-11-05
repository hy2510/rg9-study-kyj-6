import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import WordPracticeHeader from '@components/organisms/common/WordPracticeHeader'
import WordPracticeActivityStage from '@components/organisms/study/common/WordPracticeActivityStage'
import {
  StoryBodyWrapper,
  StoryViewWrapper,
} from '@components/templates/story/StoryLayout'
import WordPracticeTrackA from '@components/templates/study/word-practice/WordPracticeTrackA'
import WordPracticeTrackB from '@components/templates/study/word-practice/WordPracticeTrackB'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import useAudioPreload from '@hooks/common/useAudioPreload'
import useImagePreload from '@hooks/common/useImagePreload'
import type { WordPracticeQuizItem } from '@interfaces/study/word-practice/wordPractice'
import {
  isTranscriptionWorkerReady,
  warmupTranscriptionWorker,
} from '@services/localSpeakTranscription'
import { getWordPracticeQuiz } from '@services/wordApi'
import {
  resolveActiveWordPracticeLevel,
  type WordPracticeStepItemCounts,
} from '@src/constants/study/word-practice/wordPracticeDevEntry'
import {
  getWordPracticeTrack,
  resolveWordPracticeLevel,
  type WordPracticeLevelCode,
  type WordPracticeTrack,
} from '@src/constants/study/word-practice/wordPracticeLevels'
import {
  WORD_PRACTICE_B_QUESTIONS_PER_STEP,
  WORD_PRACTICE_B_SESSION_TOTAL,
} from '@src/constants/study/word-practice/wordPracticeTrackBConfig'
import { buildWordPracticeTrackItems } from '@utils/buildWordPracticeTrackItems'

export default function WordPracticeContainer() {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps
  const language: string = (window as Window & { REF?: { language?: string } }).REF?.language ?? 'ko'

  const [isModelReady, setIsModelReady] = useState(isTranscriptionWorkerReady())
  const [quizItems, setQuizItems] = useState<WordPracticeQuizItem[]>([])
  const [quizLoading, setQuizLoading] = useState(true)
  const [quizError, setQuizError] = useState<Error | undefined>()

  useEffect(() => {
    if (isModelReady) return
    void warmupTranscriptionWorker().then(() => setIsModelReady(true))
  }, [])

  useEffect(() => {
    getWordPracticeQuiz(studyInfo.bookType, bookInfo.BookLevel)
      .then((items) => {
        setQuizItems(items)
        setQuizLoading(false)
      })
      .catch((err) => {
        setQuizError(err instanceof Error ? err : new Error(String(err)))
        setQuizLoading(false)
      })
  }, [bookInfo.BookLevel, studyInfo.bookType])

  const activeLevel: WordPracticeLevelCode = useMemo(() => {
    const bookLevel = bookInfo.BookLevel?.toLowerCase()
    if (bookLevel) return resolveWordPracticeLevel(bookLevel)
    return resolveActiveWordPracticeLevel()
  }, [bookInfo.BookLevel])

  // PB(Picture Book) 는 저레벨 코드(ka/kb/kc/1a/1b/1c) 라도 전부 고레벨 트랙(B) 으로 라우팅한다.
  const track: WordPracticeTrack =
    studyInfo.bookType === 'PB' ? 'b' : getWordPracticeTrack(activeLevel)

  const { trackAItems, trackBItems } = useMemo(
    () => buildWordPracticeTrackItems(quizItems, track, language),
    [quizItems, track, language],
  )

  const stepItemCounts: WordPracticeStepItemCounts = useMemo(
    () => ({
      practice1: trackAItems.length,
      practice2: trackAItems.length,
      practice3: trackAItems.length,
      practice4: trackAItems.length,
      practice5: trackAItems.length,
      practice6: trackAItems.length,
      practiceB1: WORD_PRACTICE_B_QUESTIONS_PER_STEP,
      practiceB2: WORD_PRACTICE_B_QUESTIONS_PER_STEP,
      practiceB3: WORD_PRACTICE_B_QUESTIONS_PER_STEP,
      practiceB4: WORD_PRACTICE_B_QUESTIONS_PER_STEP,
    }),
    [trackAItems.length],
  )

  const preloadImageUrls = useMemo(
    () =>
      trackAItems.map((item) => item.image).filter((url): url is string => !!url),
    [trackAItems],
  )
  const preloadSoundUrls = useMemo(
    () =>
      [
        ...trackAItems.map((item) => item.sound),
        ...trackBItems.map((item) => item.sound),
      ].filter((url): url is string => !!url),
    [trackAItems, trackBItems],
  )
  useImagePreload(preloadImageUrls)
  useAudioPreload(preloadSoundUrls)

  const defaultProgress = useMemo(
    () => ({
      current: 1,
      total:
        track === 'a' ? trackAItems.length * 6 : WORD_PRACTICE_B_SESSION_TOTAL,
    }),
    [track, trackAItems.length],
  )

  const [sessionProgress, setSessionProgress] = useState(defaultProgress)

  useEffect(() => {
    setSessionProgress(defaultProgress)
  }, [activeLevel, defaultProgress])

  const handleSessionProgressChange = useCallback(
    (progress: { current: number; total: number }) => {
      setSessionProgress(progress)
    },
    [],
  )

  if (!isModelReady || quizLoading) return <CenteredLoading fillViewport />
  if (quizError) return <div>Error: {quizError.message}</div>

  return (
    <StoryViewWrapper>
      <WordPracticeHeader
        progress={sessionProgress.current}
        total={sessionProgress.total}
      />
      <StoryBodyWrapper>
        <PracticeContent>
          <WordPracticeActivityStage>
            {track === 'a' ? (
              <WordPracticeTrackA
                key={activeLevel}
                level={activeLevel}
                items={trackAItems}
                stepItemCounts={stepItemCounts}
                onSessionProgressChange={handleSessionProgressChange}
              />
            ) : (
              <WordPracticeTrackB
                key={activeLevel}
                level={activeLevel}
                items={trackBItems}
                stepItemCounts={stepItemCounts}
                onSessionProgressChange={handleSessionProgressChange}
              />
            )}
          </WordPracticeActivityStage>
        </PracticeContent>
      </StoryBodyWrapper>
    </StoryViewWrapper>
  )
}

const PracticeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100%;

  ${media.mobile} {
    box-sizing: border-box;
  }
`
