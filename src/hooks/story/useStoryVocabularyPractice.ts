import { useContext, useEffect, useState } from 'react'

import { AppContext, AppContextProps } from '@contexts/AppContext'
import {
  getVocabularyPractice1,
  getVocabularyPractice2,
  getVocabularyPractice3,
  getVocabularyPractice4,
} from '@services/quiz/VocabularyAPI'
import { IQuizStudyRef } from '@src/interfaces/common/Common'
import type {
  IVocabulary1Practice,
  IVocabulary2Practice,
  IVocabulary3Practice,
  IVocabulary4Practice,
} from '@src/interfaces/study/IVocabulary'

export type StoryVocabularyPracticeState = {
  vocaData1?: IVocabulary1Practice
  vocaData2?: IVocabulary2Practice
  vocaData3?: IVocabulary3Practice
  vocaData4?: IVocabulary4Practice
}

/**
 * 스토리 Voca 미리보기·사이드 메뉴 키워드가 공유하는 어휘 연습 API 데이터.
 */
export function useStoryVocabularyPractice(): StoryVocabularyPracticeState {
  const { studyInfo } = useContext(AppContext) as AppContextProps

  const [vocaData1, setVocaData1] = useState<IVocabulary1Practice>()
  const [vocaData2, setVocaData2] = useState<IVocabulary2Practice>()
  const [vocaData3, setVocaData3] = useState<IVocabulary3Practice>()
  const [vocaData4, setVocaData4] = useState<IVocabulary4Practice>()

  const step1Activity = studyInfo?.mappedStepActivity?.[1]

  useEffect(() => {
    if (!studyInfo?.studyId || !step1Activity) return

    const datas: IQuizStudyRef = {
      mode: studyInfo.mode,
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      bookType: studyInfo.bookType,
      studyTypeCode: studyInfo.bookType === 'EB' ? '001006' : '001001',
    }

    let cancelled = false

    const run = async () => {
      switch (step1Activity) {
        case 'Vocabulary1': {
          const data = await getVocabularyPractice1(datas)
          if (!cancelled) setVocaData1(data)
          break
        }
        case 'Vocabulary2': {
          const data = await getVocabularyPractice2(datas)
          if (!cancelled) setVocaData2(data)
          break
        }
        case 'Vocabulary3': {
          const data = await getVocabularyPractice3(datas)
          if (!cancelled) setVocaData3(data)
          break
        }
        case 'Vocabulary4': {
          const data = await getVocabularyPractice4(datas)
          if (!cancelled) setVocaData4(data)
          break
        }
        default:
          break
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    studyInfo?.studyId,
    studyInfo?.studentHistoryId,
    studyInfo?.bookType,
    studyInfo?.mode,
    step1Activity,
  ])

  return { vocaData1, vocaData2, vocaData3, vocaData4 }
}
