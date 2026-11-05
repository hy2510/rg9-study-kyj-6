import { styled } from 'styled-components'

export const MatchingCardBox = styled.div<{
  isSelected?: boolean
  isMatched?: boolean
  isGrayed?: boolean
  isIncorrect?: boolean
  isDisabled?: boolean
}>`
  padding: 16px;
  border-radius: 15px;
  background-color: ${(props) => {
    if (props.isMatched && props.isGrayed) return '#E9EDF3'
    if (props.isMatched) return '#DDF2EA'
    if (props.isSelected) return 'rgba(255, 255, 255, 0.75)'
    if (props.isIncorrect) return '#EDE7EE'
    return '#FFFFFF'
  }};
  border: 1.5px solid
    ${(props) => {
      if (props.isMatched && props.isGrayed) return '#E9EDF3'
      if (props.isMatched) return '#199261'
      if (props.isSelected) return '#A2B1C4'
      if (props.isIncorrect) return '#FF374B'
      return '#E9EDF3'
    }};
  box-shadow: ${(props) =>
    props.isSelected || props.isIncorrect || props.isMatched
      ? 'none'
      : '0 3px 0 0 #e9edf3'};
  cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.05s ease;
  transform: ${(props) =>
    props.isSelected || props.isIncorrect || props.isMatched
      ? 'translateY(3px)'
      : 'translateY(0)'};
  pointer-events: ${(props) => (props.isDisabled ? 'none' : 'auto')};
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  height: 100%;
  align-self: stretch;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`
