import { useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'

import TextBox from '@components/atoms/common/TextBox'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import SelectionCardsColumn from '@components/molecules/study/layout/SelectionCardsColumn'
import QuestionContentRow from '@components/molecules/study/question/QuestionContentRow'
import { BlockTextQuizCardBox } from '@components/molecules/study/quizOptions/cards/BlockTextQuizCardBox'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'

type ReadingComprehension4Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ReadingComprehension4({
  augmentOptions,
  quizData,
  onComplete,
}: ReadingComprehension4Props) {
  const correctExample = quizData.Examples[0].Text
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

  const handleCardClick = (text: string) => {
    if (selectedText !== null) return
    setSelectedText(text)

    onComplete(text === correctExample)
  }

  return (
    <>
      <QuizBody>
        <QuestionContentRow>
          <TextBox fontSize={1.5} fontWeight={800} color='#fff'>
            <span
              dangerouslySetInnerHTML={{ __html: quizData.Question.Text }}
            />
          </TextBox>
        </QuestionContentRow>
        <SelectionCardsColumn>
          {options.map((opt, index) => (
            <BlockTextQuizCardBox
              key={opt.Text}
              $pressed={selectedText !== null && selectedText === opt.Text}
              $isCorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText === correctExample
              }
              $isIncorrect={
                selectedText !== null &&
                opt.Text === selectedText &&
                selectedText !== correctExample
              }
              onClick={() => handleCardClick(opt.Text)}
            >
              <TextBox fontSize={1.2} fontWeight={600} color='primary'>
                <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
              </TextBox>
            </BlockTextQuizCardBox>
          ))}
        </SelectionCardsColumn>
      </QuizBody>
    </>
  )
}
