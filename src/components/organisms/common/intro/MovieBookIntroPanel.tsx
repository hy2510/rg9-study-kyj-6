import { useTranslation } from 'react-i18next'

import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'

type MovieBookIntroPanelProps = {
  coverSrc: string
  onStart: () => void
}

export default function MovieBookIntroPanel({ coverSrc, onStart }: MovieBookIntroPanelProps) {
  const { t } = useTranslation()

  return (
    <IntroBackdrop role='dialog' aria-modal='true' aria-labelledby='intro-title'>
      <IntroColumn>
        <IntroCoverBook coverSrc={coverSrc} />
        <IntroTitle id='intro-title'>{t('intro.readyToWatch')}</IntroTitle>
        <IntroStartButton type='button' onClick={onStart}>
          Start
        </IntroStartButton>
      </IntroColumn>
    </IntroBackdrop>
  )
}
