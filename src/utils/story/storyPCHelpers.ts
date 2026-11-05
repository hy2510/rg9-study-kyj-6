/** 키보드 이벤트의 target이 텍스트 입력 중인 요소인지 판별 */
export function isTextEntryKeyboardTarget(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof HTMLElement)) return false

  const textEntryTarget = target.closest(
    'input, textarea, select, [contenteditable="true"]',
  )
  return Boolean(textEntryTarget)
}

/** 스토리 데이터에서 Page 번호가 중복된 항목을 제거 */
export function uniquePagesFromStory<T extends { Page: number }>(
  storyData: T[],
): T[] {
  return storyData.filter(
    (item, index, arr) => arr.findIndex((i) => i.Page === item.Page) === index,
  )
}

/** 부모 진행률 콜백용: 현재 보이는 쪽의 페이지 번호 */
export function getProgressPageForParent(
  pages: { Page: number }[],
  pageNumber: number,
  singlePagePortrait: boolean,
  spreadHalf: 0 | 1,
): number {
  const pIdx = pageNumber - 1
  const left = pages[pIdx]
  const right = pages[pIdx + 1]
  if (singlePagePortrait) {
    return spreadHalf === 0
      ? (left?.Page ?? pageNumber)
      : (right?.Page ?? left?.Page ?? pageNumber)
  }
  const maxLR = Math.max(left?.Page ?? 0, right?.Page ?? 0)
  return maxLR > 0 ? maxLR : pageNumber
}

/** 모바일: 책 양끝 탭으로 페이지 넘김 (각 장 폭 기준, px) */
export const MOBILE_BOOK_EDGE_TAP_PX = 50
