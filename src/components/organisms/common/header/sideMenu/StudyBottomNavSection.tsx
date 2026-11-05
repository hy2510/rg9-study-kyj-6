import { useTranslation } from 'react-i18next'

import Divider from '@components/atoms/common/Divider'
import { IconArrowRightUp } from '@components/atoms/common/icons/IconArrowRightUp'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'

type StudyBottomNavSectionProps = {
  isBookTypePB: boolean
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
  showVocaCardsMenu?: boolean
  onOpenVocaCards?: () => void
}

/**
 * Legacy / Remix 학습 사이드바 공통 하단 내비게이션.
 * - 다시 읽기 (Story 로 이동) — PB(Picture Book)는 Story 없으므로 미노출
 * - 단어 카드 — PB Vocabulary 학습
 * - 나가기
 */
export default function StudyBottomNavSection({
  isBookTypePB,
  onNavigateStoryStudy,
  onExitStudy,
  showVocaCardsMenu = false,
  onOpenVocaCards,
}: StudyBottomNavSectionProps) {
  const { t } = useTranslation()
  const showReadAgain = !isBookTypePB

  return (
    <Stack gap={20}>
      {showReadAgain && (
        <SideMenuRow onClick={onNavigateStoryStudy}>
          {t('story.readAgain')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )}
      {showVocaCardsMenu && onOpenVocaCards ? (
        <SideMenuRow onClick={onOpenVocaCards}>
          {t('story.vocabularyCardsTitle')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      ) : null}
      <Divider />
      <SideMenuRow onClick={onExitStudy}>
        {t('common.exit')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
    </Stack>
  )
}
