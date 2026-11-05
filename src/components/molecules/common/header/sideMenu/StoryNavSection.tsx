import { useTranslation } from 'react-i18next'

import Divider from '@components/atoms/common/Divider'
import { IconArrowRightUp } from '@components/atoms/common/icons/IconArrowRightUp'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'
import type { HeaderStoryProps } from '@interfaces/common/header/HeaderStoryProps'

type StoryNavSectionProps = {
  storyProps: HeaderStoryProps
  closeMenu: () => void
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
}

export default function StoryNavSection({
  storyProps,
  closeMenu,
  onNavigateStoryStudy,
  onExitStudy,
}: StoryNavSectionProps) {
  const { t } = useTranslation()

  return (
    <Stack gap={20}>
      <SideMenuRow
        aria-disabled={storyProps.isGoQuizDisabled}
        onClick={() => {
          if (storyProps.isGoQuizDisabled) {
            window.alert(
              t(
                storyProps.goQuizDisabledMessageKey ??
                  'story.quizRequiresFullReading',
              ),
            )
            return
          }
          closeMenu()
          onNavigateStoryStudy()
        }}
      >
        {t('story.takeQuiz')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
      {typeof storyProps.onReadAgainClick === 'function' && (
        <SideMenuRow
          onClick={() => {
            closeMenu()
            storyProps.onReadAgainClick?.()
          }}
        >
          {t('story.readAgain')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )}
      {typeof storyProps.onMovieClick === 'function' && (
        <SideMenuRow
          onClick={() => {
            closeMenu()
            storyProps.onMovieClick?.()
          }}
        >
          {t('story.watchMovie')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )}
      {typeof storyProps.onSpeakClick === 'function' && (
        <SideMenuRow
          onClick={() => {
            closeMenu()
            storyProps.onSpeakClick?.()
          }}
        >
          {t('header.speakPractice')}
          <IconArrowRightUp width={10} height={10} alt='' />
        </SideMenuRow>
      )}
      <Divider />
      <SideMenuRow onClick={onExitStudy}>
        {t('common.exit')}
        <IconArrowRightUp width={10} height={10} alt='' />
      </SideMenuRow>
    </Stack>
  )
}
