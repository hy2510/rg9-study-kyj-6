import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'

type StudyReviewIntroPanelProps = {
  coverSrc: string
  onStart: () => void
}

export default function StudyReviewIntroPanel({
  coverSrc,
  onStart,
}: StudyReviewIntroPanelProps) {
  const { t } = useTranslation()

  return (
    <IntroBackdrop
      role='dialog'
      aria-modal='true'
      aria-labelledby='study-review-intro-title'
    >
      <IntroColumn>
        <IntroCoverBook coverSrc={coverSrc} />
        <IntroTitle id='study-review-intro-title'>
          {t('intro.studyReviewTitle')}
        </IntroTitle>
        <IntroStartButton type='button' onClick={onStart}>
          {t('intro.studyReviewCta')}
        </IntroStartButton>
        <Notice>{t('intro.studyReviewNotice')}</Notice>
      </IntroColumn>
    </IntroBackdrop>
  )
}

const Notice = styled.p`
  margin: 0;
  padding: 8px 16px;
  max-width: 420px;
  text-align: center;
  font-family: 'Rg-R', sans-serif;
  font-size: 0.95em;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
`
