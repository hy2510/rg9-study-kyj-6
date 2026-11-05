import { useMemo, useState } from 'react'

import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameVocabularyWide from '@components/molecules/study/question/images/QuestionImageFrameVocabularyWide'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'

type VocabularyTest1Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function VocabularyTest1({
  augmentOptions,
  quizData,
  onComplete,
}: VocabularyTest1Props) {
  const { t } = useTranslation()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const options = useMemo(
    () => shuffle([...(quizData.Examples ?? [])]),
    [quizData.QuizId, quizData.Examples],
  )

  const handleCardClick = (word: string) => {
    if (selectedWord !== null) return // 이미 선택됨

    setSelectedWord(word)

    onComplete(word === quizData.Question.Text)
  }

  return (
    <>
      <QuestionSoundButton
        soundUrl={quizData.Question.Sound}
        augmentOptions={augmentOptions}
        forceEnable={false}
      />

      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.VOCABULARY_TEST1)}</QuizComment>

        <QuestionImageFrameVocabularyWide>
          {!imageLoaded && <CardImageSkeleton />}
          <img
            src={quizData.Question.Image}
            alt=''
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </QuestionImageFrameVocabularyWide>

        <VocabularyTest1CardsContainer>
          {options.map((opt, index) => (
            <GridQuizOptionCardBox
              key={opt.Text}
              $pressed={selectedWord !== null && selectedWord === opt.Text}
              $isCorrect={
                selectedWord !== null &&
                selectedWord === opt.Text &&
                opt.Text === quizData.Question.Text
              }
              $isIncorrect={
                selectedWord !== null &&
                selectedWord === opt.Text &&
                opt.Text !== quizData.Question.Text
              }
              onClick={() => handleCardClick(opt.Text)}
            >
              <TextBox fontSize={1.5} fontWeight={600} color='primary'>
                <span dangerouslySetInnerHTML={{ __html: opt.Text }} />
              </TextBox>
            </GridQuizOptionCardBox>
          ))}
        </VocabularyTest1CardsContainer>
      </QuizBody>
    </>
  )
}

const VocabularyTest1CardsContainer = styled.div`
  display: flex;
  gap: 12px;
`
