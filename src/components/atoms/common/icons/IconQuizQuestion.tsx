import type { SVGProps } from 'react'

export function IconQuizQuestion(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <circle cx='10' cy='10' r='9' fill='#16a66a' />
      <circle cx='7' cy='6' r='4' fill='#49c98e' opacity='0.5' />
      <text
        x='10'
        y='14.4'
        fill='#fff'
        fontFamily="'Rg-B', 'Arial Rounded MT Bold', sans-serif"
        fontSize='13'
        fontWeight='900'
        textAnchor='middle'
      >
        Q
      </text>
    </svg>
  )
}
