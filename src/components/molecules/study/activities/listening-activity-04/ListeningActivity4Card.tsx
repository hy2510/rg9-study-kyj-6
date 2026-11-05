import styled from 'styled-components'

import { IconSoundPlay } from '@components/atoms/common/icons/IconSoundPlay'
import { IconSoundStop } from '@components/atoms/common/icons/IconSoundStop'
import TextBox from '@components/atoms/common/TextBox'
import { QuizSelectableFeedbackBox } from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'
import { SoundTextQuizRowRevealCardBox } from '@components/molecules/study/quizOptions/cards/SoundTextQuizRowCard'

export type ListeningActivity4CardProps = {
  text: string
  isPressed: boolean
  isCorrect: boolean
  isIncorrect: boolean
  isPlaying: boolean
  onCardClick: () => void
  onSoundClick: (e: React.MouseEvent) => void
  /** 증강: true면 텍스트를 처음부터 표시, false면 숨김 */
  showTextDirectly?: boolean
  /** 증강: 텍스트 보기 버튼 표시 여부 (showAll=false일 때) */
  hasRevealButton?: boolean
  /** 증강: 버튼으로 텍스트가 노출됐는지 */
  isRevealed?: boolean
  /** 증강: reveal 버튼 사용 불가 (문제당 1회 사용 후) */
  isRevealDisabled?: boolean
  /** 증강: 텍스트 보기 버튼 클릭 */
  onRevealClick?: (e: React.MouseEvent) => void
}

export function ListeningActivity4Card({
  text,
  isPressed,
  isCorrect,
  isIncorrect,
  isPlaying,
  onCardClick,
  onSoundClick,
  showTextDirectly = true,
  hasRevealButton = false,
  isRevealed = false,
  isRevealDisabled = false,
  onRevealClick,
}: ListeningActivity4CardProps) {
  const shouldShowText = showTextDirectly || isRevealed
  const showRevealButton =
    hasRevealButton && !shouldShowText && !isRevealDisabled

  if (!shouldShowText && !showRevealButton) {
    return (
      <CompactSoundCardBox
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
              <IconSoundStop width={36} height={36} />
            ) : (
              <IconSoundPlay width={36} height={36} />
            )}
          </button>
        </div>
      </CompactSoundCardBox>
    )
  }

  return (
    <SoundTextQuizRowRevealCardBox
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
      {showRevealButton && (
        <div
          className='reveal-button-area'
          onClick={(e) => {
            e.stopPropagation()
            if (!isRevealDisabled) onRevealClick?.(e)
          }}
        >
          <button type='button' disabled={isRevealDisabled} tabIndex={-1}>
            텍스트 보기
          </button>
        </div>
      )}
      {shouldShowText && (
        <TextBox fontSize={1.2} fontWeight={600} color='primary'>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </TextBox>
      )}
    </SoundTextQuizRowRevealCardBox>
  )
}

const CompactSoundCardBox = styled(QuizSelectableFeedbackBox)`
  cursor: pointer;
  flex: 1;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.05s ease;

  .sound-button-area {
    display: flex;
    align-items: center;
    justify-content: center;

    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &:active {
    transform: translateY(2px);
  }
`
