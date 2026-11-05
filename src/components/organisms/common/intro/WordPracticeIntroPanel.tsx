import { useTranslation } from 'react-i18next'

import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'

type WordPracticeIntroPanelProps = {
  onStart: () => void
}

export default function WordPracticeIntroPanel({
  onStart,
}: WordPracticeIntroPanelProps) {
  const { t } = useTranslation()

  return (
    <IntroBackdrop
      role='dialog'
      aria-modal='true'
      aria-labelledby='intro-title'
    >
      <IntroColumn>
        <IntroTitle id='intro-title'>{t('intro.wordPracticeTitle')}</IntroTitle>
        <IntroStartButton type='button' onClick={onStart}>
          {t('intro.start')}
        </IntroStartButton>
      </IntroColumn>
    </IntroBackdrop>
  )
}
