import { useCallback, useEffect, useState } from 'react'

import { LegacyQuizManagerState } from '@interfaces/study/legacy/LegacyQuizManagerState'
import { LegacyStepData } from '@interfaces/study/legacy/LegacyStepData'
import {
  getClozeTest1,
  getClozeTest2,
  getClozeTest3,
} from '@services/quiz/ClozeTestAPI'
import {
  getListeningActivity1,
  getListeningActivity2,
  getListeningActivity3,
  getListeningActivity4,
} from '@services/quiz/ListeningActivityApi'
import {
  getReadingComprehension1,
  getReadingComprehension2,
  getReadingComprehension3,
  getReadingComprehension4,
} from '@services/quiz/ReadingComprehensionAPI'
import { getSummary1, getSummary2 } from '@services/quiz/SummaryApi'
import { getTrueOrFalse } from '@services/quiz/TrueOrFalseAPI'
import {
  getVocabularyTest1,
  getVocabularyTest2,
  getVocabularyTest3,
  getVocabularyTest4,
} from '@services/quiz/VocabularyAPI'
import {
  getWritingActivity1,
  getWritingActivity2,
} from '@services/quiz/WritingActivityAPI'
import { loadRecordedData } from '@services/studyApi'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IRecordAnswerType } from '@src/interfaces/common/Common'
import { IQuizStudyRef } from '@src/interfaces/common/Common'

type ActivityFetcher = (study: IQuizStudyRef) => Promise<unknown>

function getActivityFetcher(activity: string): ActivityFetcher | null {
  switch (activity) {
    case ACTIVITY.LISTENING_1:
      return getListeningActivity1
    case ACTIVITY.LISTENING_2:
      return getListeningActivity2
    case ACTIVITY.LISTENING_3:
      return getListeningActivity3
    case ACTIVITY.LISTENING_4:
      return getListeningActivity4

    case ACTIVITY.VOCABULARY_1:
      return getVocabularyTest1
    case ACTIVITY.VOCABULARY_2:
      return getVocabularyTest2
    case ACTIVITY.VOCABULARY_3:
      return getVocabularyTest3
    case ACTIVITY.VOCABULARY_4:
      return getVocabularyTest4

    case ACTIVITY.READING_COMP_1:
      return getReadingComprehension1
    case ACTIVITY.READING_COMP_2:
      return getReadingComprehension2
    case ACTIVITY.READING_COMP_3:
      return getReadingComprehension3
    case ACTIVITY.READING_COMP_4:
      return getReadingComprehension4

    case ACTIVITY.SUMMARY_1:
      return getSummary1
    case ACTIVITY.SUMMARY_2:
      return getSummary2

    case ACTIVITY.TRUE_OR_FALSE:
      return getTrueOrFalse

    case ACTIVITY.CLOZE_1:
      return getClozeTest1
    case ACTIVITY.CLOZE_2:
      return getClozeTest2
    case ACTIVITY.CLOZE_3:
      return getClozeTest3

    case ACTIVITY.WRITING_1:
      return getWritingActivity1
    case ACTIVITY.WRITING_2:
      return getWritingActivity2

    default:
      return null
  }
}

type UseLegacyQuizManagerArgs = {
  studyRef: IQuizStudyRef
  openSteps: number[]
  mappedStepActivity: string[]
}

export function useLegacyQuizManager({
  studyRef,
  openSteps,
  mappedStepActivity,
}: UseLegacyQuizManagerArgs): LegacyQuizManagerState {
  const [stepDataMap, setStepDataMap] = useState<
    Record<number, LegacyStepData>
  >({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setIsLoading(true)
      setError(null)
      try {
        const entries = await Promise.all(
          openSteps.map(async (stepId) => {
            const activity = mappedStepActivity[stepId - 1] ?? ''
            const fetcher = getActivityFetcher(activity)
            if (!fetcher) return null

            /**
             * RC4 는 재시험(step='R') 기록이 존재하면 그것을 우선 사용한다.
             * - 재시험 진행 중: 'R' 에 저장 중인 답안을 이어풀 수 있도록 한다.
             * - 재시험 완료(통과) 후: 서버가 `isReTestYn=false` + `startStep=다음스텝` 을
             *   반환해도 사이드바 채점표는 재시험 결과를 유지해야 하므로 'R' 을 그대로 사용한다.
             * - 재시험 이력이 없는 원본 진행 상태: 'R' 이 비어있어 원본 stepId 로 폴백한다.
             */
            const recordedDataPromise = (async () => {
              if (activity !== ACTIVITY.READING_COMP_4) {
                return loadRecordedData(stepId, studyRef)
              }
              const rRecords = await loadRecordedData('R', studyRef)
              if (rRecords.length > 0) return rRecords
              return loadRecordedData(stepId, studyRef)
            })()

            const [quizData, recordedData] = await Promise.all([
              fetcher(studyRef),
              recordedDataPromise,
            ])
            const quizAnswerCount =
              (quizData as { QuizAnswerCount?: number } | null | undefined)
                ?.QuizAnswerCount ?? 0
            const data: LegacyStepData = {
              activity,
              quizData,
              recordedData,
              quizAnswerCount,
            }
            return [stepId, data] as const
          }),
        )

        if (cancelled) return

        const map: Record<number, LegacyStepData> = {}
        for (const entry of entries) {
          if (entry) {
            const [stepId, data] = entry
            map[stepId] = data
          }
        }
        setStepDataMap(map)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e : new Error(String(e)))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [studyRef, openSteps, mappedStepActivity])

  const patchStepRecord = useCallback(
    (stepId: number, record: IRecordAnswerType) => {
      setStepDataMap((prev) => {
        const cur = prev[stepId]
        if (!cur) return prev
        const idx = cur.recordedData.findIndex(
          (r) => r.QuizNo === record.QuizNo,
        )
        const nextRecorded =
          idx >= 0
            ? cur.recordedData.map((r, i) => (i === idx ? record : r))
            : [...cur.recordedData, record]
        return {
          ...prev,
          [stepId]: { ...cur, recordedData: nextRecorded },
        }
      })
    },
    [],
  )

  const resetStepRecord = useCallback((stepId: number) => {
    setStepDataMap((prev) => {
      const cur = prev[stepId]
      if (!cur) return prev
      return {
        ...prev,
        [stepId]: { ...cur, recordedData: [] },
      }
    })
  }, [])

  return { stepDataMap, isLoading, error, patchStepRecord, resetStepRecord }
}
