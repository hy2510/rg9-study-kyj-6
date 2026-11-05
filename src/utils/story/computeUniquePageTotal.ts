/**
 * `Page` 번호를 가진 항목 배열에서 unique 한 최대 페이지 수를 반환한다.
 * - 빈 배열/undefined 는 최소값 1 로 보정.
 */
export function computeUniquePageTotal<T extends { Page: number }>(
  items: T[] | undefined,
): number {
  if (!items?.length) return 1
  const uniquePages = [...new Set(items.map((p) => p.Page))]
  return Math.max(1, Math.max(...uniquePages))
}
