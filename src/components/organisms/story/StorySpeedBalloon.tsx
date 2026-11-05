import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAnchorBalloonPosition } from '@hooks/story/useAnchorBalloonPosition'
import {
  formatStoryPlaybackRateLabel,
  STORY_PLAYBACK_RATES,
} from '@src/constants/story/storyPlayback'

const BALLOON_WIDTH = 200

type StorySpeedBalloonProps = {
  isOpen: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLButtonElement | null>
  layoutTrigger: boolean
  playbackRate: number
  onSelectRate: (rate: number) => void
}

export default function StorySpeedBalloon({
  isOpen,
  onClose,
  anchorRef,
  layoutTrigger,
  playbackRate,
  onSelectRate,
}: StorySpeedBalloonProps) {
  const { t } = useTranslation()
  const { top, left } = useAnchorBalloonPosition(
    isOpen,
    anchorRef,
    layoutTrigger,
    BALLOON_WIDTH,
  )

  const selectRateAndClose = (rate: number) => {
    onSelectRate(rate)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <Dimmer onClick={onClose} />
      <Balloon style={{ top, left, width: BALLOON_WIDTH }}>
        <Tail />
        <BalloonHeader>
          <Title>Speed</Title>
        </BalloonHeader>
        <OptionList role='listbox' aria-label='Playback Speed'>
          {STORY_PLAYBACK_RATES.map((rate) => {
            const selected = Math.abs(rate - playbackRate) < 0.001
            return (
              <OptionRow
                key={rate}
                type='button'
                role='option'
                aria-selected={selected}
                $selected={selected}
                onClick={() => selectRateAndClose(rate)}
              >
                {formatStoryPlaybackRateLabel(rate)}
              </OptionRow>
            )
          })}
        </OptionList>
      </Balloon>
    </>
  )
}

const Dimmer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 199;
`

const Balloon = styled.div`
  position: fixed;
  z-index: 200;
  max-height: 320px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: visible;
`

const Tail = styled.div`
  position: absolute;
  z-index: 1;
  top: -8px;
  left: 50%;
  margin-left: -8px;
  width: 16px;
  height: 16px;
  background-color: #fff;
  transform: rotate(45deg);
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.06);
`

const BalloonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e9edf3;
  flex-shrink: 0;
`

const Title = styled.span`
  font-family: 'RG-B', sans-serif;
  font-size: 0.9em;
`

const OptionList = styled.div`
  padding: 8px 0 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const OptionRow = styled.button<{ $selected: boolean }>`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: none;
  background: ${({ $selected }) =>
    $selected ? 'rgba(32, 173, 117, 0.12)' : 'transparent'};
  font-family: 'RG-B', sans-serif;
  font-size: 0.9em;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  color: ${({ $selected }) => ($selected ? '#199261' : '#3C4B62')};
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? 'rgba(32, 173, 117, 0.18)' : 'rgba(0, 0, 0, 0.04)'};
  }

  &:active {
    opacity: 0.92;
  }
`
