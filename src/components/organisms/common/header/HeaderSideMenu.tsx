import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Divider from '@components/atoms/common/Divider'
import SideMenuBackdrop from '@components/atoms/common/sideMenu/SideMenuBackdrop'
import SpeakNavSection from '@components/molecules/common/header/sideMenu/SpeakNavSection'
import StoryNavSection from '@components/molecules/common/header/sideMenu/StoryNavSection'
import WordPracticeNavSection from '@components/molecules/common/header/sideMenu/WordPracticeNavSection'
import SideMenuFloatingPanel from '@components/molecules/common/header/SideMenuFloatingPanel'
import SideMenuPanelBody from '@components/molecules/common/header/SideMenuPanelBody'
import SideMenuPanelHead from '@components/molecules/common/header/SideMenuPanelHead'
import type { HeaderSpeakProps } from '@interfaces/common/header/HeaderSpeakProps'
import type { HeaderStoryProps } from '@interfaces/common/header/HeaderStoryProps'
import { HeaderStudyProps } from '@interfaces/common/header/HeaderStudyProps'
import type { HeaderVariant } from '@interfaces/common/header/HeaderVariant'

import LegacyStudyMenuSections from './sideMenu/LegacyStudyMenuSections'
import RemixStudyMenuSections from './sideMenu/RemixStudyMenuSections'
import StoryKeywordsSection from './sideMenu/StoryKeywordsSection'
import StoryReadModeSection from './sideMenu/StoryReadModeSection'

type HeaderSideMenuProps = {
  menuOpen: boolean
  closeMenu: () => void
  bookTitle: string
  bookCode: string
  variant: HeaderVariant
  showStoryStudyToggle: boolean
  keywordList: string[]
  storyProps: HeaderStoryProps | null
  studyProps: HeaderStudyProps | null
  speakProps: HeaderSpeakProps | null
  onNavigateStoryStudy: () => void
  onExitStudy: () => void
}

export default function HeaderSideMenu({
  menuOpen,
  closeMenu,
  bookTitle,
  bookCode,
  variant,
  showStoryStudyToggle,
  keywordList,
  storyProps,
  studyProps,
  speakProps,
  onNavigateStoryStudy,
  onExitStudy,
}: HeaderSideMenuProps) {
  const { t } = useTranslation()
  if (!menuOpen) return null

  return (
    <>
      <SideMenuBackdrop
        type='button'
        aria-label={t('header.closeMenu')}
        onClick={closeMenu}
      />
      <SideMenuFloatingPanel
        role='dialog'
        aria-modal='true'
        aria-labelledby='side-menu-title'
        onClick={(e) => e.stopPropagation()}
      >
        <SideMenuPanelHead
          bookTitle={bookTitle}
          bookCode={bookCode}
          closeAriaLabel={t('header.closeMenu')}
          onClose={closeMenu}
        />
        <Divider />
        <SideMenuPanelBody>
          {variant === 'story' && storyProps && (
            <SectionStack>
              <StoryReadModeSection storyProps={storyProps} />
              <Divider />
              <StoryKeywordsSection
                keywordList={keywordList}
                vocaRows={storyProps.storyVocaKeywordRows ?? []}
                vocabularyPrintUrl={storyProps.storyVocabularyPrintUrl}
                onVocaOpen={storyProps.onVocaClick}
                pauseBookAudio={storyProps.pauseBookAudio}
                vocaAnchorRef={storyProps.vocaAnchorRef}
              />
              <Divider />
              <StoryNavSection
                storyProps={storyProps}
                closeMenu={closeMenu}
                onNavigateStoryStudy={onNavigateStoryStudy}
                onExitStudy={onExitStudy}
              />
            </SectionStack>
          )}

          {variant === 'study' &&
            studyProps &&
            studyProps.engine === 'legacy' && (
              <LegacyStudyMenuSections
                studyProps={studyProps}
                onNavigateStoryStudy={onNavigateStoryStudy}
                onExitStudy={onExitStudy}
                closeMenu={closeMenu}
              />
            )}

          {variant === 'study' &&
            studyProps &&
            studyProps.engine === 'remix' && (
              <RemixStudyMenuSections
                studyProps={studyProps}
                closeMenu={closeMenu}
                onNavigateStoryStudy={onNavigateStoryStudy}
                onExitStudy={onExitStudy}
              />
            )}

          {variant === 'speak' && speakProps && (
            <SpeakNavSection
              speakProps={speakProps}
              showStoryStudyToggle={showStoryStudyToggle}
              closeMenu={closeMenu}
              onNavigateStoryStudy={onNavigateStoryStudy}
              onExitStudy={onExitStudy}
            />
          )}

          {variant === 'wordPractice' && (
            <WordPracticeNavSection
              closeMenu={closeMenu}
              onExitStudy={onExitStudy}
            />
          )}
        </SideMenuPanelBody>
      </SideMenuFloatingPanel>
    </>
  )
}

const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`
