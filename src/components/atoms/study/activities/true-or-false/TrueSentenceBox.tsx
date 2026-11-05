import styled from 'styled-components'

export const TrueSentenceBox = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .label {
    font-family: 'Rg-B', sans-serif;
    color: #a2b1c4;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .play-btn {
    flex-shrink: 0;
    cursor: pointer;
    width: 40px;
    height: 40px;
    padding: 8px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.05s ease;

    &:active:not(:disabled) {
      transform: translateY(1px);
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
  }
`
