/** Track A(ka~1c) — Practice A1~A6 단계 전환 및 세션 진행률 집계 */
import { useCallback, useEffect, useMemo, useState } from 'react'

import WordPracticeScoreModal from '@components/organisms/study/common/WordPracticeScoreModal'
import PracticeA1 from '@components/templates/study/word-practice/practice-a/PracticeA1'
import PracticeA2 from '@components/templates/study/word-practice/practice-a/PracticeA2'
import PracticeA3 from '@components/templates/study/word-practice/practice-a/PracticeA3'
import PracticeA4 from '@components/templates/study/word-practice/practice-a/PracticeA4'
import PracticeA5 from '@components/templates/study/word-practice/practice-a/PracticeA5'
import PracticeA6 from '@components/templates/study/word-practice/practice-a/PracticeA6'
import {
  useWordPracticeScore,
  WordPracticeScoreProvider,
} from '@contexts/WordPracticeScoreContext'
import type { WordPracticeContentItem } from '@interfaces/study/word-practice/wordPractice'
import { postWordPracticeScore } from '@services/wordApi'
import {
  getWordPracticeDevInitialProgress,
  getWordPracticeInitialItemIndex,
  getWordPracticeStepOffset,
  resolveWordPracticeDevEntry,
  WORD_PRACTICE_A_STEP_ORDER,
  type WordPracticeADevStep,
  type WordPracticeStepItemCounts,
} from '@src/constants/study/word-practice/wordPracticeDevEntry'
import type { WordPracticeLevelCode } from '@src/constants/study/word-practice/wordPracticeLevels'
import { exitStudyApp } from '@utils/exitStudy'

type PracticeStep = WordPracticeADevStep

type WordPracticeTrackAProps = {
  level: WordPracticeLevelCode
  items: WordPracticeContentItem[]
  stepItemCounts: WordPracticeStepItemCounts
  onSessionProgressChange: (progress: {
    current: number
    total: number
  }) => void
}

export default function WordPracticeTrackA(props: WordPracticeTrackAProps) {
  const scoreItems = useMemo(
    () =>
      props.items.map((item) => ({
        wordId: item.wordId,
        word: item.word,
        meaning: item.meaning,
      })),
    [props.items],
  )

  return (
    <WordPracticeScoreProvider items={scoreItems}>
      <WordPracticeTrackASession {...props} />
    </WordPracticeScoreProvider>
  )
}

function WordPracticeTrackASession({
  level,
  items,
  stepItemCounts,
  onSessionProgressChange,
}: WordPracticeTrackAProps) {
  const { getScoreSummaries, getScorePayload } = useWordPracticeScore()

  const submitStepScores = useCallback(
    async (step: PracticeStep) => {
      const payload = getScorePayload()
      const scores = payload
        .map((item) => {
          const stepEvents = item.events.filter((e) => e.step === step)
          return {
            wordId: item.wordId,
            correctCount: stepEvents.filter((e) => e.result === 'correct').length,
            wrongCount: stepEvents.filter((e) => e.result === 'incorrect').length,
          }
        })
        .filter((s) => s.correctCount > 0 || s.wrongCount > 0)
      if (scores.length === 0) return
      await postWordPracticeScore(scores).catch(console.error)
    },
    [getScorePayload],
  )
  const totalQuestions = useMemo(
    () =>
      WORD_PRACTICE_A_STEP_ORDER.reduce(
        (sum, step) => sum + stepItemCounts[step],
        0,
      ),
    [stepItemCounts],
  )

  const devEntry = resolveWordPracticeDevEntry(
    WORD_PRACTICE_A_STEP_ORDER,
    stepItemCounts,
  )
  const initialPracticeStep: PracticeStep =
    (devEntry?.step as PracticeStep | undefined) ?? 'practice1'
  const initialProgress = getWordPracticeDevInitialProgress(
    initialPracticeStep,
    totalQuestions,
    WORD_PRACTICE_A_STEP_ORDER,
    stepItemCounts,
  )

  const [showScoreModal, setShowScoreModal] = useState(false)
  const [practiceStep, setPracticeStep] =
    useState<PracticeStep>(initialPracticeStep)
  const [progress, setProgress] = useState(initialProgress)

  useEffect(() => {
    onSessionProgressChange(progress)
  }, [onSessionProgressChange, progress])

  const stepOffset = useMemo(
    () =>
      getWordPracticeStepOffset(
        practiceStep,
        WORD_PRACTICE_A_STEP_ORDER,
        stepItemCounts,
      ),
    [practiceStep, stepItemCounts],
  )

  const handleProgressChange = useCallback(
    (current: number) => {
      setProgress({
        current: stepOffset + current,
        total: totalQuestions,
      })
    },
    [stepOffset, totalQuestions],
  )

  const handlePractice1Complete = useCallback(() => {
    setPracticeStep('practice2')
  }, [])

  const handlePractice2Complete = useCallback(async () => {
    await submitStepScores('practice2')
    setPracticeStep('practice3')
  }, [submitStepScores])

  const handlePractice3Complete = useCallback(async () => {
    await submitStepScores('practice3')
    setPracticeStep('practice4')
  }, [submitStepScores])

  const handlePractice4Complete = useCallback(async () => {
    await submitStepScores('practice4')
    setPracticeStep('practice5')
  }, [submitStepScores])

  const handlePractice5Complete = useCallback(async () => {
    await submitStepScores('practice5')
    setPracticeStep('practice6')
  }, [submitStepScores])

  const handlePractice6Complete = useCallback(async () => {
    await submitStepScores('practice6')
    setProgress({ current: totalQuestions, total: totalQuestions })
    setShowScoreModal(true)
  }, [submitStepScores, totalQuestions])

  return (
    <>
      {practiceStep === 'practice1' && (
        <PracticeA1
          key={`${level}-practice1`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice1',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice1Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practice2' && (
        <PracticeA2
          key={`${level}-practice2`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice2',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice2Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practice3' && (
        <PracticeA3
          key={`${level}-practice3`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice3',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice3Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practice4' && (
        <PracticeA4
          key={`${level}-practice4`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice4',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice4Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practice5' && (
        <PracticeA5
          key={`${level}-practice5`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice5',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice5Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practice6' && (
        <PracticeA6
          key={`${level}-practice6`}
          items={items}
          initialIndex={getWordPracticeInitialItemIndex(
            'practice6',
            WORD_PRACTICE_A_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePractice6Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {showScoreModal && (
        <WordPracticeScoreModal
          items={getScoreSummaries()}
          onProceed={exitStudyApp}
        />
      )}
    </>
  )
}

export type { WordPracticeTrackAProps }
