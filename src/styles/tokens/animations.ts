import { keyframes } from 'styled-components'

export const confettiExplosion = keyframes`
  0%,
  10% {
    transform: scale(0);
    opacity: 0;
  }
  25% {
    transform: scale(1.1);
    opacity: 1;
  }
  65%,
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
`

export const glassWindowFlow = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-130%) skewX(-18deg) scale(0.8);
  }

  18% {
    opacity: 0.85;
  }

  50% {
    opacity: 0.95;
    transform: translateX(0) skewX(-18deg) scale(1.18);
  }

  82% {
    opacity: 0.75;
  }

  100% {
    opacity: 0;
    transform: translateX(130%) skewX(-18deg) scale(0.8);
  }
`

export const floatBob = keyframes`
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`

export const coverSkeletonShimmer = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`

export const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

export const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const quizContainerShake = keyframes`
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
`
