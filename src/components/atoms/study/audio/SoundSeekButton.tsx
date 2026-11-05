import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

type SoundSeekButtonProps = {
  onClick: () => void
  disabled?: boolean
  'aria-label': string
  children: string
}

export function SoundSeekButton({
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
  children,
}: SoundSeekButtonProps) {
  return (
    <SeekButton
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </SeekButton>
  )
}

const SeekButton = styled.button`
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  border: 2px solid rgb(162, 177, 196, 0.25);
  border-radius: 50%;
  background: #f5f6f8;
  color: #a2b1c4;
  font-size: 0.7em;
  font-weight: 700;
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  cursor: pointer;
  transition: transform 0.05s ease;
  flex-shrink: 0;

  &:disabled {
    opacity: 0;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98) translateY(1px);
  }

  ${media.mobile} {
    width: 26px;
    height: 26px;
    min-width: 26px;
    font-size: 0.62em;
  }
`
