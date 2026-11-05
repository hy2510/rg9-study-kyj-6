import { useContext, useEffect, useState } from 'react'

import { AppContext, AppContextProps } from '@contexts/AppContext'
import {
  getVocabularyPractice1,
  getVocabularyPractice2,
  getVocabularyPractice3,
  getVocabularyPractice4,
} from '@services/quiz/VocabularyAPI'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IQuizStudyRef } from '@src/interfaces/common/Common'
import type {
  IVocabulary1Practice,
  IVocabulary2Practice,
  IVocabulary3Practice,
  IVocabulary4Practice,
} from '@src/interfaces/study/IVocabulary'

export type VocabularyPracticeByActivityState = {
  vocaData1?: IVocabulary1Practice
  vocaData2?: IVocabulary2Practice
  vocaData3?: IVocabulary3Practice
  vocaData4?: IVocabulary4Practice
  isVocaPracticeLoading: boolean
  loadedActivity?: string
}

export function useVocabularyPracticeByActivity(
  activity: string | undefined,
): VocabularyPracticeByActivityState {
  const { studyInfo } = useContext(AppContext) as AppContextProps

  const [vocaData1, setVocaData1] = useState<IVocabulary1Practice>()
  const [vocaData2, setVocaData2] = useState<IVocabulary2Practice>()
  const [vocaData3, setVocaData3] = useState<IVocabulary3Practice>()
  const [vocaData4, setVocaData4] = useState<IVocabulary4Practice>()
  const [isVocaPracticeLoading, setIsVocaPracticeLoading] = useState(false)
  const [loadedActivity, setLoadedActivity] = useState<string>()

  useEffect(() => {
    if (!studyInfo?.studyId || !activity) {
      setVocaData1(undefined)
      setVocaData2(undefined)
      setVocaData3(undefined)
      setVocaData4(undefined)
      setIsVocaPracticeLoading(false)
      setLoadedActivity(undefined)
      return
    }

    const datas: IQuizStudyRef = {
      mode: studyInfo.mode,
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      bookType: studyInfo.bookType,
      studyTypeCode: studyInfo.bookType === 'EB' ? '001006' : '001001',
    }

    let cancelled = false

    const run = async () => {
      setIsVocaPracticeLoading(true)
      setVocaData1(undefined)
      setVocaData2(undefined)
      setVocaData3(undefined)
      setVocaData4(undefined)
      setLoadedActivity(undefined)

      try {
        switch (activity) {
          case ACTIVITY.VOCABULARY_1: {
            const data = await getVocabularyPractice1(datas)
            if (!cancelled) {
              setVocaData1(data)
              setLoadedActivity(activity)
            }
            break
          }
          case ACTIVITY.VOCABULARY_2: {
            const data = await getVocabularyPractice2(datas)
            if (!cancelled) {
              setVocaData2(data)
              setLoadedActivity(activity)
            }
            break
          }
          case ACTIVITY.VOCABULARY_3: {
            const data = await getVocabularyPractice3(datas)
            if (!cancelled) {
              setVocaData3(data)
              setLoadedActivity(activity)
            }
            break
          }
          case ACTIVITY.VOCABULARY_4: {
            const data = await getVocabularyPractice4(datas)
            if (!cancelled) {
              setVocaData4(data)
              setLoadedActivity(activity)
            }
            break
          }
          default:
            break
        }
      } finally {
        if (!cancelled) {
          setLoadedActivity(activity)
          setIsVocaPracticeLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    activity,
    studyInfo?.studyId,
    studyInfo?.studentHistoryId,
    studyInfo?.bookType,
    studyInfo?.mode,
  ])

  return {
    vocaData1,
    vocaData2,
    vocaData3,
    vocaData4,
    isVocaPracticeLoading,
    loadedActivity,
  }
}
