import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import styled from 'styled-components'

type ButtonProps = ComponentPropsWithoutRef<'button'>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { type = 'button', ...rest },
  ref,
) {
  return <ButtonStyled ref={ref} type={type} {...rest} />
})

export default Button

const ButtonStyled = styled.button`
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
  font: inherit;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`
