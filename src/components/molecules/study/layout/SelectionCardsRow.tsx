import { media } from '@styles/tokens/breakpoints'
import type { ReactNode } from 'react'
import styled from 'styled-components'

type FlexDirection = 'row' | 'column'

type SelectionCardsRowProps = {
  children: ReactNode
  direction?: FlexDirection
  mobileDirection?: FlexDirection
  fitMobileHeight?: boolean
}

export default function SelectionCardsRow({
  children,
  direction = 'row',
  mobileDirection = direction,
  fitMobileHeight = false,
}: SelectionCardsRowProps) {
  return (
    <Wrap
      $direction={direction}
      $mobileDirection={mobileDirection}
      $fitMobileHeight={fitMobileHeight}
    >
      {children}
    </Wrap>
  )
}

const Wrap = styled.div<{
  $direction: FlexDirection
  $mobileDirection: FlexDirection
  $fitMobileHeight: boolean
}>`
  display: flex;
  flex-direction: ${(p) => p.$direction};
  gap: 12px;
  justify-content: center;
  align-items: center;

  ${media.mobile} {
    gap: 8px;
    flex-direction: ${(p) => p.$mobileDirection};
  }

  @media (max-width: 767px) {
    ${(p) =>
      p.$fitMobileHeight &&
      `
        gap: 8px;
        flex-direction: ${p.$mobileDirection};
        flex: 1;
        width: 100%;
        max-width: 100%;
        min-height: 0;
        max-height: calc(100vh - 220px);
        max-height: calc(100dvh - 220px);
        align-items: stretch;
        overflow: hidden;
        padding-right: 2px;
        padding-bottom: 4px;
        box-sizing: border-box;

        && > * {
          flex: 0 1 auto;
          min-height: 0;
          height: auto;
          width: auto;
          max-width: 100%;
          box-sizing: border-box;
        }

        && > * > * {
          height: auto;
          min-height: clamp(150px, 28vh, 240px);
          min-height: clamp(150px, 28dvh, 240px);
        }

        && > * img {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
          max-height: calc((100vh - 228px) / 2);
          max-height: calc((100dvh - 228px) / 2);
          object-fit: contain;
        }
      `}
  }

  @media (max-width: 767px) and (orientation: landscape) {
    ${(p) =>
      p.$fitMobileHeight &&
      `
        flex-direction: ${p.$direction};
        max-height: calc(100vh - 170px);
        max-height: calc(100dvh - 170px);

        && > * {
          flex: 1 1 0;
          width: 0;
          min-width: 0;
          height: auto;
        }

        && > * > * {
          width: 100%;
          height: clamp(110px, 42vh, 170px);
          height: clamp(110px, 42dvh, 170px);
          min-height: clamp(110px, 42vh, 170px);
          min-height: clamp(110px, 42dvh, 170px);
        }

        && > * img {
          width: 100%;
          height: 100%;
          max-height: 100%;
        }
      `}
  }

  /* 펼친 폴더블: 세로 방향이어도 가용 폭이 넓으면 선택지를 좌우로 배치한다. */
  @media (min-width: 600px) and (max-width: 767px) {
    ${(p) =>
      p.$fitMobileHeight &&
      `
        flex-direction: ${p.$direction};

        && > * {
          flex: 1 1 0;
          width: 0;
          min-width: 0;
          height: auto;
        }

        && > * > * {
          width: 100%;
        }
      `}
  }

  /* 소형 태블릿 세로: 가로형 카드 배치를 유지하면서 컨테이너 안에 맞춘다. */
  @media (min-width: 768px) and (max-width: 820px) and (orientation: portrait) {
    ${(p) =>
      p.$fitMobileHeight &&
      `
        gap: 8px;
        flex-direction: ${p.$direction};
        width: 100%;
        max-width: 100%;
        min-height: 0;
        max-height: calc(100vh - 180px);
        max-height: calc(100dvh - 180px);
        align-items: stretch;
        overflow: hidden;
        padding-right: 2px;
        padding-bottom: 4px;
        box-sizing: border-box;

        && > * {
          flex: 1 1 0;
          width: 0;
          min-width: 0;
          min-height: 0;
          height: auto;
          max-width: 100%;
          box-sizing: border-box;
        }

        && > * > * {
          width: 100%;
          height: auto;
          min-width: 0;
          min-height: 0;
        }

        && > * img {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
          max-height: calc(100vh - 188px);
          max-height: calc(100dvh - 188px);
          object-fit: contain;
        }
      `}
  }
`
