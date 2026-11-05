import { useCallback, useEffect, useMemo, useState } from 'react'

import WordPracticeScoreModal from '@components/organisms/study/common/WordPracticeScoreModal'
import PracticeB1 from '@components/templates/study/word-practice/practice-b/PracticeB1'
import PracticeB2 from '@components/templates/study/word-practice/practice-b/PracticeB2'
import PracticeB3 from '@components/templates/study/word-practice/practice-b/PracticeB3'
import PracticeB4 from '@components/templates/study/word-practice/practice-b/PracticeB4'
import {
  useWordPracticeScore,
  WordPracticeScoreProvider,
} from '@contexts/WordPracticeScoreContext'
import type { WordMeaningPracticeItem } from '@interfaces/study/word-practice/wordMeaningPractice'
import { postWordPracticeScore } from '@services/wordApi'
import {
  getWordPracticeDevInitialProgress,
  getWordPracticeInitialItemIndex,
  getWordPracticeStepOffset,
  resolveWordPracticeDevEntry,
  WORD_PRACTICE_B_STEP_ORDER,
  type WordPracticeBDevStep,
  type WordPracticeStepItemCounts,
} from '@src/constants/study/word-practice/wordPracticeDevEntry'
import type { WordPracticeLevelCode } from '@src/constants/study/word-practice/wordPracticeLevels'
import {
  buildWordPracticeBStepItems,
  WORD_PRACTICE_B_QUESTIONS_PER_SESSION_CYCLE,
  WORD_PRACTICE_B_SESSION_CYCLE_COUNT,
  WORD_PRACTICE_B_SESSION_TOTAL,
} from '@src/constants/study/word-practice/wordPracticeTrackBConfig'
import { exitStudyApp } from '@utils/exitStudy'

type PracticeStep = WordPracticeBDevStep

type WordPracticeTrackBProps = {
  level: WordPracticeLevelCode
  items: WordMeaningPracticeItem[]
  stepItemCounts: WordPracticeStepItemCounts
  onSessionProgressChange: (progress: {
    current: number
    total: number
  }) => void
}

export default function WordPracticeTrackB(props: WordPracticeTrackBProps) {
  return (
    <WordPracticeScoreProvider items={props.items}>
      <WordPracticeTrackBSession {...props} />
    </WordPracticeScoreProvider>
  )
}

function WordPracticeTrackBSession({
  level,
  items,
  stepItemCounts,
  onSessionProgressChange,
}: WordPracticeTrackBProps) {
  const { getScoreSummaries, getScorePayload } = useWordPracticeScore()

  const submitStepScores = useCallback(
    async (step: PracticeStep) => {
      const payload = getScorePayload()
      const scores = payload
        .map((item) => {
          const stepEvents = item.events.filter((e) => e.step === step)
          return {
            wordId: item.wordId,
            correctCount: stepEvents.filter((e) => e.result === 'correct')
              .length,
            wrongCount: stepEvents.filter((e) => e.result === 'incorrect')
              .length,
          }
        })
        .filter((s) => s.correctCount > 0 || s.wrongCount > 0)
      if (scores.length === 0) return
      await postWordPracticeScore(scores).catch(console.error)
    },
    [getScorePayload],
  )
  const sessionCycleCount = WORD_PRACTICE_B_SESSION_CYCLE_COUNT
  const totalQuestions = WORD_PRACTICE_B_SESSION_TOTAL

  const devEntry = resolveWordPracticeDevEntry(
    WORD_PRACTICE_B_STEP_ORDER,
    stepItemCounts,
  )
  const initialPracticeStep: PracticeStep =
    (devEntry?.step as PracticeStep | undefined) ?? 'practiceB1'
  const initialProgress = getWordPracticeDevInitialProgress(
    initialPracticeStep,
    totalQuestions,
    WORD_PRACTICE_B_STEP_ORDER,
    stepItemCounts,
  )

  const [sessionCycle, setSessionCycle] = useState(0)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [practiceStep, setPracticeStep] =
    useState<PracticeStep>(initialPracticeStep)
  const [progress, setProgress] = useState(initialProgress)

  const sessionStepItems = useMemo(
    () => buildWordPracticeBStepItems(items, sessionCycle),
    [items, sessionCycle],
  )

  useEffect(() => {
    onSessionProgressChange(progress)
  }, [onSessionProgressChange, progress])

  const stepOffset = useMemo(
    () =>
      sessionCycle * WORD_PRACTICE_B_QUESTIONS_PER_SESSION_CYCLE +
      getWordPracticeStepOffset(
        practiceStep,
        WORD_PRACTICE_B_STEP_ORDER,
        stepItemCounts,
      ),
    [practiceStep, sessionCycle, stepItemCounts],
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

  const handlePracticeB1Complete = useCallback(async () => {
    await submitStepScores('practiceB1')
    setPracticeStep('practiceB2')
  }, [submitStepScores])

  const handlePracticeB2Complete = useCallback(async () => {
    await submitStepScores('practiceB2')
    setPracticeStep('practiceB3')
  }, [submitStepScores])

  const handlePracticeB3Complete = useCallback(async () => {
    await submitStepScores('practiceB3')
    setPracticeStep('practiceB4')
  }, [submitStepScores])

  const handlePracticeB4Complete = useCallback(async () => {
    await submitStepScores('practiceB4')
    if (sessionCycle < sessionCycleCount - 1) {
      setSessionCycle((prev) => prev + 1)
      setPracticeStep('practiceB1')
      return
    }
    setProgress({ current: totalQuestions, total: totalQuestions })
    setShowScoreModal(true)
  }, [sessionCycle, sessionCycleCount, submitStepScores, totalQuestions])

  const practiceKey = `${level}-${practiceStep}-cycle${sessionCycle}`

  return (
    <>
      {practiceStep === 'practiceB1' && (
        <PracticeB1
          key={practiceKey}
          items={sessionStepItems}
          initialIndex={getWordPracticeInitialItemIndex(
            'practiceB1',
            WORD_PRACTICE_B_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePracticeB1Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practiceB2' && (
        <PracticeB2
          key={practiceKey}
          items={sessionStepItems}
          initialIndex={getWordPracticeInitialItemIndex(
            'practiceB2',
            WORD_PRACTICE_B_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePracticeB2Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practiceB3' && (
        <PracticeB3
          key={practiceKey}
          items={sessionStepItems}
          initialIndex={getWordPracticeInitialItemIndex(
            'practiceB3',
            WORD_PRACTICE_B_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePracticeB3Complete}
          onProgressChange={handleProgressChange}
        />
      )}
      {practiceStep === 'practiceB4' && (
        <PracticeB4
          key={practiceKey}
          items={sessionStepItems}
          initialIndex={getWordPracticeInitialItemIndex(
            'practiceB4',
            WORD_PRACTICE_B_STEP_ORDER,
            stepItemCounts,
          )}
          onComplete={handlePracticeB4Complete}
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

export type { WordPracticeTrackBProps }
