import AugmentCardsContainer from '@components/atoms/study/augment/AugmentCardsContainer'
import AugmentModal from '@components/atoms/study/augment/AugmentModal'
import AugmentOverlay from '@components/atoms/study/augment/AugmentOverlay'
import AugmentPrimaryButton from '@components/atoms/study/augment/AugmentPrimaryButton'
import AcquiredAugmentCard from '@components/molecules/study/augment/AcquiredAugmentCard'
import { SelectedAugment } from '@hooks/study/remix/useAugmentManager'

type AcquiredAugmentsModalProps = {
  selectedAugments: SelectedAugment[]
  onClose: () => void
}

export default function AcquiredAugmentsModal({
  selectedAugments,
  onClose,
}: AcquiredAugmentsModalProps) {
  return (
    <AugmentOverlay
      $clickable
      onClick={onClose}
      role='button'
      tabIndex={0}
      aria-label='모달 닫기'
    >
      <AugmentModal $gap={24} $scrollable onClick={(e) => e.stopPropagation()}>
        <AugmentCardsContainer $gap={16}>
          {selectedAugments.map((augment) => (
            <AcquiredAugmentCard
              key={`${augment.id}-${augment.stage}`}
              id={augment.id}
              tier={augment.tier}
              descriptionKor={augment.descriptionKor}
            />
          ))}
        </AugmentCardsContainer>
        <AugmentPrimaryButton $variant='medium' onClick={onClose}>
          닫기
        </AugmentPrimaryButton>
      </AugmentModal>
    </AugmentOverlay>
  )
}
