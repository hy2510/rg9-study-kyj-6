import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { IconClockBasic } from '@components/atoms/common/icons/IconClockBasic'
import { IconHeartBasic } from '@components/atoms/common/icons/IconHeartBasic'
import { IconMenu } from '@components/atoms/common/icons/IconMenu'
import TextBox from '@components/atoms/common/TextBox'

export type QuizStatusPillProps = {
  showStudyStatus: boolean
  isReviewMode: boolean
  reviewCurrent?: number
  reviewTotal?: number
  timeText: string
  currentHeart: number
  showProgressText: boolean
  progress: number
  total: number
  statusLabel?: string
  onClick?: () => void
  ariaLabel?: string
}

export default function QuizStatusPill({
  showStudyStatus,
  isReviewMode,
  reviewCurrent,
  reviewTotal,
  timeText,
  currentHeart,
  showProgressText,
  progress,
  total,
  statusLabel,
  onClick,
  ariaLabel,
}: QuizStatusPillProps) {
  if (!showStudyStatus && !showProgressText) return null

  const content = (
    <>
      {showStudyStatus &&
        (statusLabel ? (
          <TextBox fontSize={1} fontWeight={6} color='primary'>
            {statusLabel}
          </TextBox>
        ) : isReviewMode && reviewCurrent != null && reviewTotal != null ? (
          <TextBox fontSize={1} fontWeight={6} color='primary'>
            Review {reviewCurrent}/{reviewTotal}
          </TextBox>
        ) : (
          <>
            <div className='time'>
              <IconClockBasic width={24} height={24} alt='' aria-hidden />
              <TextBox fontSize={1} fontWeight={6} color='primary'>
                {timeText}
              </TextBox>
            </div>
            <div className='heart'>
              <IconHeartBasic width={24} height={24} alt='' aria-hidden />
              <TextBox fontSize={1} fontWeight={6} color='primary'>
                {currentHeart}
              </TextBox>
            </div>
          </>
        ))}
      {showProgressText && (
        <TextBox fontSize={0.9} fontWeight={6} color='primary'>
          {progress} / {total}
        </TextBox>
      )}
    </>
  )

  if (onClick) {
    return (
      <PillRoot
        as='button'
        type='button'
        onClick={onClick}
        aria-label={ariaLabel}
        $clickable
      >
        {content}
        <span className='more' aria-hidden>
          <IconMenu width={20} height={20} alt='' />
        </span>
      </PillRoot>
    )
  }

  return <PillRoot>{content}</PillRoot>
}

const PillRoot = styled.div<{ $clickable?: boolean }>`
  position: fixed;
  top: calc(15px + env(safe-area-inset-top, 0px));
  left: ${({ $clickable }) =>
    $clickable ? 'auto' : 'calc(15px + env(safe-area-inset-left, 0px))'};
  right: ${({ $clickable }) =>
    $clickable ? 'calc(15px + env(safe-area-inset-right, 0px))' : 'auto'};
  z-index: 100;
  min-width: 40px;
  width: auto;
  height: 37px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 12px;
  padding-top: 3px;
  border: none;
  appearance: none;
  font: inherit;
  color: inherit;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  ${media.mobile} {
    top: calc(16px + env(safe-area-inset-top, 0px));
    left: ${({ $clickable }) =>
      $clickable ? 'auto' : 'calc(8px + env(safe-area-inset-left, 0px))'};
    right: ${({ $clickable }) =>
      $clickable ? 'calc(8px + env(safe-area-inset-right, 0px))' : 'auto'};
    height: 34px;
    padding: 0 10px;
  }

  .time,
  .heart {
    display: flex;
    align-items: center;
    gap: 6px;

    img {
      display: block;
      width: 24px;
      height: 24px;
      margin-bottom: 3px;
    }
  }

  .more {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 2px;
    margin-bottom: 2px;

    img {
      display: block;
      width: 20px;
      height: 20px;
    }
  }
`
