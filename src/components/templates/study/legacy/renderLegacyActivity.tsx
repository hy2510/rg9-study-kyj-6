import { ReactNode } from 'react'

import ClozeTest1 from '@components/templates/study/legacy/ClozeTest1'
import ClozeTest2 from '@components/templates/study/legacy/ClozeTest2'
import ClozeTest3 from '@components/templates/study/legacy/ClozeTest3'
import ListeningActivity1 from '@components/templates/study/legacy/ListeningActivity1'
import ListeningActivity2 from '@components/templates/study/legacy/ListeningActivity2'
import ListeningActivity3 from '@components/templates/study/legacy/ListeningActivity3'
import ListeningActivity4 from '@components/templates/study/legacy/ListeningActivity4'
import ReadingComprehension1 from '@components/templates/study/legacy/ReadingComprehension1'
import ReadingComprehension2 from '@components/templates/study/legacy/ReadingComprehension2'
import ReadingComprehension3 from '@components/templates/study/legacy/ReadingComprehension3'
import ReadingComprehension4 from '@components/templates/study/legacy/ReadingComprehension4'
import Summary1 from '@components/templates/study/legacy/Summary1'
import Summary2 from '@components/templates/study/legacy/Summary2'
import TrueOrFalse from '@components/templates/study/legacy/TrueOrFalse'
import VocabularyTest1 from '@components/templates/study/legacy/VocabularyTest1'
import VocabularyTest2 from '@components/templates/study/legacy/VocabularyTest2'
import VocabularyTest3 from '@components/templates/study/legacy/VocabularyTest3'
import VocabularyTest4 from '@components/templates/study/legacy/VocabularyTest4'
import WritingActivity1 from '@components/templates/study/legacy/WritingActivity1'
import WritingActivity2 from '@components/templates/study/legacy/WritingActivity2'
import WritingActivity2Review from '@components/templates/study/legacy/WritingActivity2Review'
import WritingActivity2Rewriting from '@components/templates/study/legacy/WritingActivity2Rewriting'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import type { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'

type RenderLegacyActivityParams = {
  activity: string
  /** Writing2 리뷰/재작성 전용 — prefetch 없이 전달 */
  datas: ILegacyStudyData
  /** 그 외 활동 공통 — prefetch(quizData/recordedData) 포함 */
  datasWithPrefetch: ILegacyStudyData
  /** `studyInfo.isReview` */
  isWriting2Review: boolean
  /** `RevisionStatusCode` 가 `028010` / `028009` 이면 Rewriting, 아니면 Review */
  isWriting2Rewriting: boolean
}

/**
 * Legacy 활동 코드 → 활동 컴포넌트 매핑.
 * - 매핑 목록은 `LegacyStudyContainer` 의 분기 로직과 1:1 대응.
 * - `WRITING_2` 는 리뷰 모드 세분화를 위해 `datas`(no prefetch) 를 사용한다.
 */
export function renderLegacyActivity({
  activity,
  datas,
  datasWithPrefetch,
  isWriting2Review,
  isWriting2Rewriting,
}: RenderLegacyActivityParams): ReactNode {
  switch (activity) {
    case ACTIVITY.LISTENING_1:
      return <ListeningActivity1 {...datasWithPrefetch} />
    case ACTIVITY.LISTENING_2:
      return <ListeningActivity2 {...datasWithPrefetch} />
    case ACTIVITY.LISTENING_3:
      return <ListeningActivity3 {...datasWithPrefetch} />
    case ACTIVITY.LISTENING_4:
      return <ListeningActivity4 {...datasWithPrefetch} />
    case ACTIVITY.VOCABULARY_1:
      return <VocabularyTest1 {...datasWithPrefetch} />
    case ACTIVITY.VOCABULARY_2:
      return <VocabularyTest2 {...datasWithPrefetch} />
    case ACTIVITY.VOCABULARY_3:
      return <VocabularyTest3 {...datasWithPrefetch} />
    case ACTIVITY.VOCABULARY_4:
      return <VocabularyTest4 {...datasWithPrefetch} />
    case ACTIVITY.READING_COMP_1:
      return <ReadingComprehension1 {...datasWithPrefetch} />
    case ACTIVITY.READING_COMP_2:
      return <ReadingComprehension2 {...datasWithPrefetch} />
    case ACTIVITY.READING_COMP_3:
      return <ReadingComprehension3 {...datasWithPrefetch} />
    case ACTIVITY.READING_COMP_4:
      return <ReadingComprehension4 {...datasWithPrefetch} />
    case ACTIVITY.SUMMARY_1:
      return <Summary1 {...datasWithPrefetch} />
    case ACTIVITY.SUMMARY_2:
      return <Summary2 {...datasWithPrefetch} />
    case ACTIVITY.TRUE_OR_FALSE:
      return <TrueOrFalse {...datasWithPrefetch} />
    case ACTIVITY.CLOZE_1:
      return <ClozeTest1 {...datasWithPrefetch} />
    case ACTIVITY.CLOZE_2:
      return <ClozeTest2 {...datasWithPrefetch} />
    case ACTIVITY.CLOZE_3:
      return <ClozeTest3 {...datasWithPrefetch} />
    case ACTIVITY.WRITING_1:
      return <WritingActivity1 {...datasWithPrefetch} />
    case ACTIVITY.WRITING_2:
      if (isWriting2Review) {
        return isWriting2Rewriting ? (
          <WritingActivity2Rewriting {...datas} />
        ) : (
          <WritingActivity2Review {...datas} />
        )
      }
      return <WritingActivity2 {...datasWithPrefetch} />
    default:
      return null
  }
}
