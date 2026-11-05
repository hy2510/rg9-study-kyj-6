import { styled } from 'styled-components'

/** 단어 하나를 감싸는 컨테이너 — HiddenInput + InlineSpellingSlots 를 포함 */
export const PenaltyWordBox = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  /* margin: 0 4px; */
  cursor: text;
`

/** 실제 키보드 입력을 받는 숨겨진 input — 포커스 가능하지만 시각적으로 비표시 */
export const PenaltyHiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: none;
  outline: none;
  cursor: text;
  font-size: inherit;
`

/** 단어의 각 문자 슬롯을 감싸는 컨테이너 */
export const PenaltySpellingSlots = styled.span<{ $isCurrent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 8px;
  /* border: 1.5px solid ${(p) => (p.$isCurrent ? '#199261' : '#a2b1c4')}; */
  /* background: ${(p) => (p.$isCurrent ? '#f0fdf8' : '#f5f6f8')}; */
  transition: all 0.2s ease;
`

/** 개별 문자 슬롯 — 미입력(ghost): 회색, 입력됨: 초록, 오입력: 빨강 */
export const PenaltyCharSlot = styled.span<{
  $isFixed?: boolean
  $isPlaceholder?: boolean
  $isIncorrect?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* min-width: ${(p) => (p.$isFixed ? '8px' : '18px')}; */
  height: 26px;
  font-family: 'Rg-B', sans-serif;
  font-size: 1em;
  font-weight: 700;
  color: ${(p) =>
    p.$isPlaceholder ? '#a2b1c4' : p.$isIncorrect ? '#ef3d2e' : '#199261'};
  border-bottom: ${(p) =>
    p.$isFixed
      ? 'none'
      : `1px solid ${
          p.$isPlaceholder
            ? '#a2b1c425'
            : p.$isIncorrect
              ? '#ef3d2e'
              : '#199261'
        }`};
`

/** 패널티에서 이미 완료된 단어 표시 */
export const PenaltySolvedWord = styled.span`
  display: inline;
  /* color: #289ee4; */
  font-family: 'Rg-B', sans-serif;
  /* margin: 0 4px; */
`
