import { ComponentType } from 'react'

import ClozeTest1 from '@components/templates/study/remix/activities/cloze-test/ClozeTest1'
import ClozeTest2 from '@components/templates/study/remix/activities/cloze-test/ClozeTest2'
import ClozeTest3 from '@components/templates/study/remix/activities/cloze-test/ClozeTest3'
import ListeningActivity3 from '@components/templates/study/remix/activities/listening-activity/ListeningActivity3'
import ListeningActivity4 from '@components/templates/study/remix/activities/listening-activity/ListeningActivity4'
import ReadingComprehension1 from '@components/templates/study/remix/activities/reading-comprehension/ReadingComprehension1'
import ReadingComprehension2 from '@components/templates/study/remix/activities/reading-comprehension/ReadingComprehension2'
import ReadingComprehension3 from '@components/templates/study/remix/activities/reading-comprehension/ReadingComprehension3'
import ReadingComprehension4 from '@components/templates/study/remix/activities/reading-comprehension/ReadingComprehension4'
import VocabularyTest1 from '@components/templates/study/remix/activities/vocabulary-test/VocabularyTest1'
import VocabularyTest2 from '@components/templates/study/remix/activities/vocabulary-test/VocabularyTest2'
import VocabularyTest3 from '@components/templates/study/remix/activities/vocabulary-test/VocabularyTest3'
import VocabularyTest4 from '@components/templates/study/remix/activities/vocabulary-test/VocabularyTest4'
import WritingActivity1 from '@components/templates/study/remix/activities/writing-activity/WritingActivity1'
import type { ActivityType } from '@hooks/study/remix/useQuizManager'

/** 액티비티 컴포넌트 설정 (표준: quizData 단일 / Vocabulary3: quizzes 배열) */
type ActivityComponentConfig = {
  component: ComponentType<object>
  useQuizzes: boolean
}

export const ACTIVITY_COMPONENTS = {
  ListeningActivity3: { component: ListeningActivity3, useQuizzes: false },
  ListeningActivity4: { component: ListeningActivity4, useQuizzes: false },
  Vocabulary1: { component: VocabularyTest1, useQuizzes: false },
  Vocabulary2: { component: VocabularyTest2, useQuizzes: false },
  Vocabulary3: { component: VocabularyTest3, useQuizzes: true },
  Vocabulary4: { component: VocabularyTest4, useQuizzes: false },
  ReadingComprehension1: {
    component: ReadingComprehension1,
    useQuizzes: false,
  },
  ReadingComprehension2: {
    component: ReadingComprehension2,
    useQuizzes: false,
  },
  ReadingComprehension3: {
    component: ReadingComprehension3,
    useQuizzes: false,
  },
  ReadingComprehension4: {
    component: ReadingComprehension4,
    useQuizzes: false,
  },
  ClozeTest1: { component: ClozeTest1, useQuizzes: false },
  ClozeTest2: { component: ClozeTest2, useQuizzes: false },
  ClozeTest3: { component: ClozeTest3, useQuizzes: false },
  WritingActivity1: { component: WritingActivity1, useQuizzes: false },
} as Partial<Record<ActivityType | string, ActivityComponentConfig>>
