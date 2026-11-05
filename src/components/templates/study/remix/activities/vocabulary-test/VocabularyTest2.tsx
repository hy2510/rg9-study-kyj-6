import { useMemo, useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import shuffle from 'lodash/shuffle'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { CardImageSkeleton } from '@components/atoms/study/cards/CardImageSkeleton'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionImageFrameVocabularyNarrow from '@components/molecules/study/question/images/QuestionImageFrameVocabularyNarrow'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { GridQuizOptionCardBox } from '@components/molecules/study/quizOptions/cards/GridQuizOptionCardBox'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { createSentenceWithBlank } from '@utils/common'

type VocabularyTest2Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

export default function VocabularyTest2({
  augmentOptions,
  quizData,
  onComplete,
}: VocabularyTest2Props) {
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

    onComplete(word === quizData.Examples[0].Text)
  }

  return (
    <>
      <QuestionSoundButton
        soundUrl={quizData.Question.Sound}
        augmentOptions={augmentOptions}
        forceEnable={false}
      />

      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.VOCABULARY_TEST2)}</QuizComment>

        <QuestionImageFrameVocabularyNarrow>
          {!imageLoaded && <CardImageSkeleton />}
          <img
            src={quizData.Question.Image}
            alt=''
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </QuestionImageFrameVocabularyNarrow>

        <VocabularyTest2QuestionContainer>
          <TextBox fontSize={1.5} fontWeight={600} color='#fff'>
            <span
              dangerouslySetInnerHTML={{
                __html: createSentenceWithBlank(
                  quizData.Question.Text,
                  quizData.Question.Word,
                ),
              }}
            />
          </TextBox>
        </VocabularyTest2QuestionContainer>

        <VocabularyTest2CardsContainer>
          {options.map((opt, index) => (
            <GridQuizOptionCardBox
              key={opt.Text}
              $pressed={selectedWord !== null && selectedWord === opt.Text}
              $isCorrect={
                selectedWord !== null &&
                selectedWord === opt.Text &&
                opt.Text === quizData.Examples[0].Text
              }
              $isIncorrect={
                selectedWord !== null &&
                selectedWord === opt.Text &&
                opt.Text !== quizData.Examples[0].Text
              }
              onClick={() => handleCardClick(opt.Text)}
            >
              <TextBox fontSize={1.5} fontWeight={600} color='primary'>
                {opt.Text}
              </TextBox>
            </GridQuizOptionCardBox>
          ))}
        </VocabularyTest2CardsContainer>
      </QuizBody>
    </>
  )
}

const VocabularyTest2QuestionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`

const VocabularyTest2CardsContainer = styled.div`
  display: flex;
  gap: 12px;

  ${media.mobile} {
    flex-direction: column;
    gap: 8px;
  }
`
