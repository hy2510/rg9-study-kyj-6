/* eslint-disable react-hooks/refs */
import { type MouseEvent } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { IconChevronDown } from '@components/atoms/common/icons/IconChevronDown'
import SectionTitle from '@components/atoms/common/SectionTitle'
import { formatStoryPlaybackRateLabel } from '@constants/story/storyPlayback'
import { getStoryReadingProfileLabel } from '@constants/story/storyReadingProfile'
import type { HeaderStoryProps } from '@interfaces/common/header/HeaderStoryProps'

type StoryReadModeSectionProps = {
  storyProps: HeaderStoryProps
}

export default function StoryReadModeSection({
  storyProps,
}: StoryReadModeSectionProps) {
  const { t: _t } = useTranslation()

  const handleStoryProfileTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    storyProps.onProfileBalloonToggle?.()
  }
  const handleStorySpeedTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    storyProps.onSpeedBalloonToggle?.()
  }

  const pageTurnShortLabel =
    (storyProps.isAutoNext ?? false) ? 'Auto Play · On' : 'Auto Play · Off'

  return (
    <ReadModeRoot>
      <SectionTitle>Read Mode</SectionTitle>
      <ChipRow>
        {storyProps.readingProfile &&
          storyProps.profileAnchorRef &&
          storyProps.onProfileBalloonToggle && (
            <Chip
              ref={storyProps.profileAnchorRef}
              type='button'
              onClick={handleStoryProfileTriggerClick}
            >
              {getStoryReadingProfileLabel(storyProps.readingProfile)}
              <IconChevronDown width={14} height={14} alt='' />
            </Chip>
          )}

        {storyProps.onAutoNextToggle && (
          <Chip type='button' onClick={() => storyProps.onAutoNextToggle?.()}>
            {pageTurnShortLabel}
          </Chip>
        )}

        {storyProps.playbackRate !== undefined &&
          storyProps.speedAnchorRef &&
          storyProps.onSpeedBalloonToggle && (
            <Chip
              ref={storyProps.speedAnchorRef}
              type='button'
              onClick={handleStorySpeedTriggerClick}
            >
              Speed {formatStoryPlaybackRateLabel(storyProps.playbackRate)}
              <IconChevronDown width={14} height={14} alt='' />
            </Chip>
          )}
      </ChipRow>
    </ReadModeRoot>
  )
}

const ReadModeRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button`
  cursor: pointer;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 15px;
  border: none;
  border-radius: 100px;
  background: rgba(233, 237, 243, 0.5);
  font-family: 'Rg-B', sans-serif;
  font-size: 0.9em;
  color: #1f2937;
  -webkit-text-fill-color: #1f2937;
  -webkit-appearance: none;
  appearance: none;
`
