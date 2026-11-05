import { useTranslation } from 'react-i18next'

import { IconArrowRightUp } from '@components/atoms/common/icons/IconArrowRightUp'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'

type WordPracticeNavSectionProps = {
  closeMenu: () => void
  onExitStudy: () => void
}

export default function WordPracticeNavSection({
  closeMenu,
  onExitStudy,
}: WordPracticeNavSectionProps) {
  const { t } = useTranslation()

  return (
    <Stack gap={20}>
      <SideMenuRow
        onClick={() => {
          closeMenu()
          onExitStudy()
        }}
      >
        {t('common.exit')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
    </Stack>
  )
}
