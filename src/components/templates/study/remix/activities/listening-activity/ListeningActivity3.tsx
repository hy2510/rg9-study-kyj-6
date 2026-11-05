import { useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'

import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import SelectionCardsRow from '@components/molecules/study/layout/SelectionCardsRow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { LargeImageQuizChoiceCard } from '@components/molecules/study/quizOptions/cards/LargeImageQuizChoiceCard'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type ListeningActivity3Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function ListeningActivity3({
  augmentOptions,
  quizData,
  onComplete,
}: ListeningActivity3Props) {
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
          {t(ACTIVITY_INSTRUCTIONS.LISTENING_ACTIVITY3)}
        </QuizComment>

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
