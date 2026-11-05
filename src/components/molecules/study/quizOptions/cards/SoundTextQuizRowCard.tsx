import styled, { css } from 'styled-components'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { QuizSelectableFeedbackBox } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

const soundOrRevealAreaStyles = css`
  flex-shrink: 0;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.05s ease;

  &:active {
    transform: translateY(1px);
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;

    img {
      display: block;
    }
  }
`

/** 소리 + 텍스트 한 줄 선택 (독해 2·3유형) */
export const SoundTextQuizRowCardBox = styled(QuizSelectableFeedbackBox)`
  cursor: pointer;
  width: calc(100% - 32px);
  min-height: 28px;
  height: fit-content;
  border-radius: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px;
  transition: all 0.05s ease;

  .sound-button-area {
    ${soundOrRevealAreaStyles}
  }
`

/** 리스닝 4유형 — “텍스트 보기” 버튼 영역 포함 */
export const SoundTextQuizRowRevealCardBox = styled(SoundTextQuizRowCardBox)`
  .sound-button-area,
  .reveal-button-area {
    ${soundOrRevealAreaStyles}
  }

  .reveal-button-area {
    button {
      width: auto;
      font-size: 0.85rem;
      color: #666;
      white-space: nowrap;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
`

export type SoundTextQuizRowCardProps = {
  text: string
  isPressed: boolean
  isCorrect: boolean
  isIncorrect: boolean
  isPlaying: boolean
  onCardClick: () => void
  onSoundClick: (e: React.MouseEvent) => void
}

export function SoundTextQuizRowCard({
  text,
  isPressed,
  isCorrect,
  isIncorrect,
  isPlaying,
  onCardClick,
  onSoundClick,
}: SoundTextQuizRowCardProps) {
  return (
    <SoundTextQuizRowCardBox
      $pressed={isPressed}
      $isCorrect={isCorrect}
      $isIncorrect={isIncorrect}
      onClick={onCardClick}
    >
      <div
        className='sound-button-area'
        onClick={onSoundClick}
        aria-label={isPlaying ? '정지' : '재생'}
      >
        <button type='button' tabIndex={-1}>
          {isPlaying ? (
            <IconSoundStop width={32} height={32} />
          ) : (
            <IconSoundPlay width={32} height={32} />
          )}
        </button>
      </div>
      <TextBox fontSize={1.2} fontWeight={600} color='primary'>
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </TextBox>
    </SoundTextQuizRowCardBox>
  )
}
