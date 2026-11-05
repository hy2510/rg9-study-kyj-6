import { useTranslation } from 'react-i18next'

import Divider from '@components/atoms/common/Divider'
import { IconArrowRightUp } from '@components/atoms/common/icons/IconArrowRightUp'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'
import type { HeaderSpeakProps } from '@interfaces/common/header/HeaderSpeakProps'

type SpeakNavSectionProps = {
  speakProps: HeaderSpeakProps
  showStoryStudyToggle: boolean
  closeMenu: () => void
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
}

export default function SpeakNavSection({
  speakProps,
  showStoryStudyToggle: _showStoryStudyToggle,
  closeMenu,
  onNavigateStoryStudy: _onNavigateStoryStudy,
  onExitStudy,
}: SpeakNavSectionProps) {
  const { t } = useTranslation()

  return (
    <Stack gap={20}>
      {typeof speakProps.onOpenSpeakPractice === 'function' && (
        <SideMenuRow
          onClick={() => {
            closeMenu()
            speakProps.onOpenSpeakPractice?.()
          }}
        >
          {t('story.speakStart')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )}
      <SideMenuRow
        onClick={() => {
          closeMenu()
          speakProps.onBackToStory()
        }}
      >
        {t('story.speakEnd')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
      {/* {showStoryStudyToggle && (
        <SideMenuRow onClick={onNavigateStoryStudy}>
          {t('story.takeQuiz')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )} */}
      <Divider />
      <SideMenuRow onClick={onExitStudy}>
        {t('common.exit')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
    </Stack>
  )
}
