import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconMenu } from '@components/atoms/common/icons/IconMenu'
import QuizStatusPill, {
  type QuizStatusPillProps,
} from '@components/molecules/common/header/QuizStatusPill'
import StoryQuizSegmentToggle from '@components/molecules/common/header/StoryQuizSegmentToggle'
import type { HeaderVariant } from '@interfaces/common/header/HeaderVariant'

type SegmentToggleProps = {
  show: boolean
  onSelect: (target: 'story' | 'quiz') => void
}

type HeaderTopBarProps = {
  variant: HeaderVariant
  onToggleMenu?: () => void
  quizStatus: QuizStatusPillProps
  segmentToggle: SegmentToggleProps
}

export default function HeaderTopBar({
  variant,
  onToggleMenu,
  quizStatus,
  segmentToggle,
}: HeaderTopBarProps) {
  const { t } = useTranslation()
  const storySideActive = variant === 'story' || variant === 'speak'
  const quizSideActive = variant === 'study'

  return (
    <>
      {variant === 'study' || variant === 'story' ? (
        onToggleMenu ? (
          <MenuButton
            type='button'
            onClick={onToggleMenu}
            aria-label={t('header.menu')}
          >
            <IconMenu width={28} height={28} alt='' />
          </MenuButton>
        ) : null
      ) : (
        <QuizStatusPill
          {...quizStatus}
          onClick={variant === 'speak' ? undefined : onToggleMenu}
          ariaLabel={variant === 'speak' ? undefined : t('header.menu')}
        />
      )}

      {segmentToggle.show && (
        <TopBarMenuCluster>
          <StoryQuizSegmentToggle
            storySideActive={storySideActive}
            quizSideActive={quizSideActive}
            onSelect={segmentToggle.onSelect}
          />
        </TopBarMenuCluster>
      )}
    </>
  )
}

const MenuButton = styled.button`
  position: absolute;
  top: calc(15px + env(safe-area-inset-top, 0px));
  right: calc(8px + env(safe-area-inset-right, 0px));
  z-index: 100;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  appearance: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:active {
    transform: scale(0.93);
    opacity: 0.88;
  }

  img,
  svg {
    display: block;
    width: 16px;
    height: 16px;
  }

  ${media.mobile} {
    top: max(44px, calc(16px + env(safe-area-inset-top, 0px)));
    right: calc(8px + env(safe-area-inset-right, 0px));
  }
`

const TopBarMenuCluster = styled.div`
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;

  ${media.mobile} {
    top: calc(10px + env(safe-area-inset-top, 0px));
    right: calc(10px + env(safe-area-inset-right, 0px));
  }
`
