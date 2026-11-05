import type { RefObject } from 'react'
import styled from 'styled-components'

import { useAnchorBalloonPosition } from '@hooks/story/useAnchorBalloonPosition'
import type { StoryReadingProfile } from '@src/constants/story/storyReadingProfile'
import {
  getStoryReadingProfileLabel,
  STORY_READING_PROFILES_ORDER,
} from '@src/constants/story/storyReadingProfile'

/**
 * 하이라이트 데이터가 없는 도서(`HighlightDataYn === false`)에서 노출할 프로필.
 * 하이라이트만 없을 뿐 음원/텍스트는 정상이므로
 * `noHighlight`(Focus · Off) 와 `noAudio`(Text Only) 두 가지를 제공.
 */
const NON_HIGHLIGHT_PROFILES: StoryReadingProfile[] = ['noHighlight', 'noAudio']

const BALLOON_WIDTH = 260

type StoryReadingModeBalloonProps = {
  isOpen: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLButtonElement | null>
  layoutTrigger: boolean
  readingProfile: StoryReadingProfile
  onSelectProfile: (profile: StoryReadingProfile) => void
  hasHighlightData?: boolean
}

export default function StoryReadingModeBalloon({
  isOpen,
  onClose,
  anchorRef,
  layoutTrigger,
  readingProfile,
  onSelectProfile,
  hasHighlightData = true,
}: StoryReadingModeBalloonProps) {
  const profiles = hasHighlightData
    ? STORY_READING_PROFILES_ORDER
    : NON_HIGHLIGHT_PROFILES
  const { top, left } = useAnchorBalloonPosition(
    isOpen,
    anchorRef,
    layoutTrigger,
    BALLOON_WIDTH,
  )

  const selectProfileAndClose = (profile: StoryReadingProfile) => {
    onSelectProfile(profile)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <Dimmer onClick={onClose} />
      <Balloon style={{ top, left, width: BALLOON_WIDTH }}>
        <Tail />
        <BalloonHeader>
          <Title>Focus</Title>
        </BalloonHeader>
        <OptionList role='listbox'>
          {profiles.map((profile) => {
            const selected = profile === readingProfile
            return (
              <OptionRow
                key={profile}
                type='button'
                role='option'
                aria-selected={selected}
                $selected={selected}
                onClick={() => selectProfileAndClose(profile)}
              >
                {getStoryReadingProfileLabel(profile)}
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
  max-height: 360px;
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
