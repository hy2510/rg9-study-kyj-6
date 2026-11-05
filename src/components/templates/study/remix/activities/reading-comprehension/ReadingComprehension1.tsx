import { useMemo, useState } from 'react'

import { TEXT_SHADOW_SOFT } from '@styles/tokens/textShadow'
import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import SelectionCardsRow from '@components/molecules/study/layout/SelectionCardsRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { LargeImageQuizChoiceCard } from '@components/molecules/study/quizOptions/cards/LargeImageQuizChoiceCard'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ReadingComprehension1Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ReadingComprehension1({
  augmentOptions,
  quizData,
  onComplete,
}: ReadingComprehension1Props) {
  const { t } = useTranslation()
  const [selectedText, setSelectedText] = useState<string | null>(null)

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

  const handleCardClick = (text: string) => {
    if (selectedText !== null) return
    setSelectedText(text)

    onComplete(text === quizData.Question.Text)
  }
  return (
    <>
      <QuestionSoundButton soundUrl={quizData.Question.Sound} autoPlay={true} />
      <QuizBody>
        <QuizComment>
          {t(ACTIVITY_INSTRUCTIONS.READING_COMPREHENSION1)}
        </QuizComment>
        <ReadingComprehension1QuestionContainer>
          <TextBox
            fontSize={1.5}
            fontWeight={600}
            color='#fff'
            style={{ textShadow: TEXT_SHADOW_SOFT }}
          >
            {quizData.Question.Text}
          </TextBox>
        </ReadingComprehension1QuestionContainer>
        <SelectionCardsRow mobileDirection='column' fitMobileHeight>
          {options.map((opt, index) => (
            <LargeImageQuizChoiceCard
              key={index}
              index={index}
              image={opt.Image}
              text={opt.Text}
              selectedText={selectedText}
              reserveLoadingHeight
              isCorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text === quizData.Question.Text
              }
              isIncorrect={
                selectedText !== null &&
                selectedText === opt.Text &&
                opt.Text !== quizData.Question.Text
              }
              onCardClick={() => handleCardClick(opt.Text)}
            />
          ))}
        </SelectionCardsRow>
      </QuizBody>
    </>
  )
}

const ReadingComprehension1QuestionContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 50px;
`
