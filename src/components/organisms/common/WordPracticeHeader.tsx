import { useState } from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconDeleteGray } from '@components/atoms/common/icons/IconDeleteGray'
import QuizStatusPill from '@components/molecules/common/header/QuizStatusPill'
import ProgressBar from '@components/molecules/common/ProgressBar'
import WordPracticeExitConfirm from '@components/molecules/common/WordPracticeExitConfirm'
import { exitStudyApp } from '@utils/exitStudy'

type WordPracticeHeaderProps = {
  progress: number
  total: number
}

export default function WordPracticeHeader({
  progress,
  total,
}: WordPracticeHeaderProps) {
  const { t } = useTranslation()
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    exitStudyApp()
  }

  return (
    <>
      <QuizStatusPill
        showStudyStatus={false}
        isReviewMode={false}
        timeText=''
        currentHeart={0}
        showProgressText
        progress={progress}
        total={total}
      />
      <ExitButton
        type='button'
        aria-label={t('study.wordPracticeExitAriaLabel')}
        onClick={() => setShowExitConfirm(true)}
      >
        <IconDeleteGray width={24} height={24} alt='' />
      </ExitButton>
      <WordPracticeExitConfirm
        open={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirmExit={handleConfirmExit}
      />
      <ProgressBar progress={progress} total={total} />
    </>
  )
}

const ExitButton = styled.button`
  position: fixed;
  top: calc(15px + env(safe-area-inset-top, 0px));
  right: calc(15px + env(safe-area-inset-right, 0px));
  z-index: 100;
  width: 44px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 100px;
  background: rgb(255, 255, 255, 0.5);
  padding: 0;
  cursor: pointer;
  transition: transform 0.05s ease;

  ${media.mobile} {
    top: calc(10px + env(safe-area-inset-top, 0px));
    right: calc(10px + env(safe-area-inset-right, 0px));
    width: 40px;
    height: 36px;
  }

  &:active {
    transform: scale(0.96) translateY(1px);
  }
`
