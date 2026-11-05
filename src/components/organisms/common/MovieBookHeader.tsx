import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Divider from '@components/atoms/common/Divider'
import { IconArrowRightUp } from '@components/atoms/common/icons/IconArrowRightUp'
import { IconMenu } from '@components/atoms/common/icons/IconMenu'
import HeaderMenuButtonBase from '@components/atoms/common/sideMenu/HeaderMenuButton'
import SideMenuBackdrop from '@components/atoms/common/sideMenu/SideMenuBackdrop'
import SideMenuRow from '@components/atoms/common/sideMenu/SideMenuRow'
import Stack from '@components/atoms/common/Stack'
import SideMenuFloatingPanel from '@components/molecules/common/header/SideMenuFloatingPanel'
import SideMenuPanelBody from '@components/molecules/common/header/SideMenuPanelBody'
import SideMenuPanelHead from '@components/molecules/common/header/SideMenuPanelHead'
import StoryKeywordsSection from '@components/organisms/common/header/sideMenu/StoryKeywordsSection'
import type { StoryVocaKeywordRow } from '@utils/story/flattenVocabularyPracticeRows'

type MovieBookHeaderProps = {
  bookCode: string
  bookTitle?: string
  isGoQuizDisabled: boolean
  /**
   * "퀴즈 풀기" 비활성화 시 얼럿에 노출할 i18n 메시지 키.
   * 미지정 시 기본값 `'story.quizRequiresFullReading'` 사용.
   */
  goQuizDisabledMessageKey?: string
  hasSpeakContent: boolean
  keywordList: string[]
  vocaRows: StoryVocaKeywordRow[]
  vocabularyPrintUrl?: string
  onGoQuiz: () => void
  onSpeakPractice: () => void
  onExitStudy: () => void
}

export default function MovieBookHeader({
  bookCode,
  bookTitle: bookTitleProp,
  isGoQuizDisabled,
  goQuizDisabledMessageKey,
  hasSpeakContent,
  keywordList,
  vocaRows,
  vocabularyPrintUrl,
  onGoQuiz,
  onSpeakPractice,
  onExitStudy,
}: MovieBookHeaderProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const bookTitle = bookTitleProp?.trim() || bookCode

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat || e.defaultPrevented) return
      setMenuOpen((open) => !open)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <HeaderMenuButton
        type='button'
        aria-label={t('header.menu')}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <IconMenu width={20} height={20} alt='' />
      </HeaderMenuButton>

      {menuOpen && (
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
              <Stack gap={18}>
                <StoryKeywordsSection
                  keywordList={keywordList}
                  vocaRows={vocaRows}
                  vocabularyPrintUrl={vocabularyPrintUrl}
                />
                <Divider />
                <Stack gap={20}>
                  {hasSpeakContent && (
                    <SideMenuRow
                      onClick={() => {
                        closeMenu()
                        onSpeakPractice()
                      }}
                    >
                      {t('header.speakPractice')}
                      <IconArrowRightUp width={10} height={10} alt='' />
                    </SideMenuRow>
                  )}
                  <SideMenuRow
                    aria-disabled={isGoQuizDisabled}
                    onClick={() => {
                      if (isGoQuizDisabled) {
                        window.alert(
                          t(
                            goQuizDisabledMessageKey ??
                              'story.quizRequiresFullReading',
                          ),
                        )
                        return
                      }
                      closeMenu()
                      onGoQuiz()
                    }}
                  >
                    {t('story.takeQuiz')}
                    <IconArrowRightUp width={10} height={10} alt='' />
                  </SideMenuRow>
                  <SideMenuRow onClick={onExitStudy}>
                    {t('common.exit')}
                    <IconArrowRightUp width={10} height={10} alt='' />
                  </SideMenuRow>
                </Stack>
              </Stack>
            </SideMenuPanelBody>
          </SideMenuFloatingPanel>
        </>
      )}
    </>
  )
}

const HeaderMenuButton = styled(HeaderMenuButtonBase)`
  position: fixed;
  top: 23px;
  right: 15px;
  z-index: 100;
`
