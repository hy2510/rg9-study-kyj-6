import { useState } from 'react'

import AugmentCardsContainer from '@components/atoms/study/augment/AugmentCardsContainer'
import AugmentModal from '@components/atoms/study/augment/AugmentModal'
import AugmentOverlay from '@components/atoms/study/augment/AugmentOverlay'
import AugmentPrimaryButton from '@components/atoms/study/augment/AugmentPrimaryButton'
import AugmentTitle from '@components/atoms/study/augment/AugmentTitle'
import SelectableAugmentCard from '@components/molecules/study/augment/SelectableAugmentCard'
import { IAugment } from '@hooks/study/remix/useAugmentManager'
import { AUGMENT_IDS } from '@src/constants/study/remix/augment'

type AugmentProps = {
  selectableAugments: IAugment[]
  stage: number
  round: number
  increaseHeart: (amount: number) => void
  resetHeart: () => void
  increaseShield: () => void
  increaseTime: (time: number) => void
  selectAugment: (augment: IAugment, stage: number, round: number) => void
  onClose: () => void
  onGoToQuiz: () => void
}

export default function Augment({
  selectableAugments,
  stage,
  round,
  increaseHeart,
  resetHeart,
  increaseShield,
  increaseTime,
  selectAugment,
  onClose: _onClose,
  onGoToQuiz,
}: AugmentProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const handleCardClick = (id: string) => {
    setSelectedCard(id)
  }

  const handleGoToQuiz = () => {
    if (selectedCard === null) return

    const selectedAugment = selectableAugments.find(
      (augment) => augment.id === selectedCard,
    )

    if (selectedAugment) {
      switch (selectedAugment.id) {
        case AUGMENT_IDS.HEART.HIRE_LEONI:
          increaseShield()
          break

        case AUGMENT_IDS.HEART.SHEILA_PANCAKE:
          increaseHeart(1)
          break

        case AUGMENT_IDS.HEART.BLANC_BANDAGE:
          increaseHeart(2)
          break

        case AUGMENT_IDS.HEART.GREENTHUMB_MAGIC_BEANS:
          increaseHeart(3)
          break

        case AUGMENT_IDS.HEART.GINO_WINNING_HEADBAND:
          resetHeart()
          break

        case AUGMENT_IDS.TIME.DODO_MAGIC_CLOCK:
          increaseTime(180)
          break
        default:
      }

      selectAugment(selectedAugment, stage, round)
    }

    onGoToQuiz()
  }

  return (
    <AugmentOverlay>
      <AugmentModal onClick={(e) => e.stopPropagation()}>
        <AugmentTitle>보상을 선택하세요</AugmentTitle>

        <AugmentCardsContainer>
          {selectableAugments.map((augment) => (
            <SelectableAugmentCard
              key={augment.id}
              id={augment.id}
              tier={augment.tier}
              descriptionKor={augment.descriptionKor}
              isSelected={selectedCard === augment.id}
              onClick={() => handleCardClick(augment.id)}
            />
          ))}
        </AugmentCardsContainer>

        <AugmentPrimaryButton
          onClick={handleGoToQuiz}
          disabled={selectedCard === null}
        >
          다음 Stage로
        </AugmentPrimaryButton>
      </AugmentModal>
    </AugmentOverlay>
  )
}
