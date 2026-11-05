import { styled } from 'styled-components'

/**
 * 파란색 primary CTA 버튼.
 * - $variant: 'large'(Augment의 다음 Stage) | 'medium'(Acquired의 닫기)
 */
const AugmentPrimaryButton = styled.button<{ $variant?: 'large' | 'medium' }>`
  padding: ${({ $variant = 'large' }) =>
    $variant === 'large' ? '14px 48px' : '12px 32px'};
  font-size: ${({ $variant = 'large' }) =>
    $variant === 'large' ? '18px' : '16px'};
  font-weight: 600;
  color: #fff;
  background-color: ${({ disabled }) => (disabled ? '#ccc' : '#007bff')};
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  align-self: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(
      -${({ $variant = 'large' }) => ($variant === 'large' ? '2px' : '1px')}
    );
    ${({ $variant = 'large' }) =>
      $variant === 'large'
        ? 'box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);'
        : ''}
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
  }
`

export default AugmentPrimaryButton
