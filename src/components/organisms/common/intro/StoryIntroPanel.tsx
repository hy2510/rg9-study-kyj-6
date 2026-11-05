import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import IntroCoverBook from '@components/molecules/common/intro/IntroCoverBook'
import {
  IntroBackdrop,
  IntroColumn,
  IntroStartButton,
  IntroTitle,
} from '@components/molecules/common/intro/IntroLayout'

type StoryIntroPanelProps = {
  coverSrc: string
  onStart: () => void
}

export default function StoryIntroPanel({ coverSrc, onStart }: StoryIntroPanelProps) {
  const { t } = useTranslation()

  return (
    <IntroBackdrop
      role='dialog'
      aria-modal='true'
      aria-labelledby='intro-title'
    >
      <IntroColumn>
        <IntroCoverBook coverSrc={coverSrc} />
        <IntroTitle id='intro-title'>{t('intro.readyToRead')}</IntroTitle>
        <StoryStartButton type='button' onClick={onStart}>
          Start
        </StoryStartButton>
      </IntroColumn>
    </IntroBackdrop>
  )
}

const StoryStartButton = styled(IntroStartButton)`
  border-color: #ff374b;
  background-color: #ff374b;
  box-shadow: 0 3px 0 0 #ce0000;
`
