import { useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  ClozeTest1BlankSlot,
  ClozeTest1SentenceText,
} from '@components/molecules/study/activities/cloze-test-01/ClozeTest1Slots'
import TwoColumnCards from '@components/molecules/study/layout/TwoColumnCards'
import QuestionContentRow from '@components/molecules/study/question/QuestionContentRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ClozeTest1Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ClozeTest1({
  augmentOptions,
  quizData,
  onComplete,
}: ClozeTest1Props) {
  const { t } = useTranslation()
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const sentence = quizData.Question.Text

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

  const sentenceParts = sentence.split('┒')
  const blankCount = Math.max(sentenceParts.length - 1, 1)
  // 정답은 셔플 전 원본 기준(첫 번째 빈칸 = Examples[0]), options는 보기 순서만 섞은 것
  const correctAnswer = quizData.Examples[0].Text

  const handleCardClick = (text: string) => {
    if (selectedText !== null) return
    setSelectedText(text)

    const isCorrect = text === correctAnswer
    onComplete(isCorrect)
  }

  const renderSentenceWithBlanks = () => (
    <ClozeTest1SentenceText>
      {sentenceParts.map((part, i) => (
        <span key={i}>
          {part}
          {i < blankCount && (
            <ClozeTest1BlankSlot $filled={selectedText === correctAnswer}>
              {selectedText ?? '\u00A0'}
            </ClozeTest1BlankSlot>
          )}
        </span>
      ))}
    </ClozeTest1SentenceText>
  )

  return (
    <>
      <QuestionSoundButton
        augmentOptions={augmentOptions}
        soundUrl={quizData.Question.Sound}
        forceEnable={false}
      />
      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.CLOZE_TEST1)}</QuizComment>
        <QuestionContentRow>
          <TextBox fontSize={1.2} fontWeight={800} color='primary'>
            {renderSentenceWithBlanks()}
          </TextBox>
        </QuestionContentRow>
        <TwoColumnCards>
          {options.map((opt, index) => (
            <ClozeOptionCard
              key={opt.Text}
              $pressed={selectedText !== null && selectedText === opt.Text}
              $isCorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text === correctAnswer
              }
              $isIncorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text !== correctAnswer
              }
              $isInGrid={true}
              onClick={() => handleCardClick(opt.Text)}
            >
              <TextBox fontSize={1.2} fontWeight={600} color='primary'>
                <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
              </TextBox>
            </ClozeOptionCard>
          ))}
        </TwoColumnCards>
      </QuizBody>
    </>
  )
}

const ClozeOptionCard = styled(GridQuizOptionCardBox)`
  width: 100%;
`
