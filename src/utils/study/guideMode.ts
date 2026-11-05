/**
 * guide 모드에서 부모 페이지(iframe 삽입 측)의 origin을 반환한다.
 *
 * allowedOrigin을 REF 파라미터로 별도 전달하는 대신,
 * iframe 내부에서 document.referrer를 통해 부모 origin을 직접 파악한다.
 */
export function getGuideParentOrigin(): string | undefined {
  try {
    if (!document.referrer) return undefined
    return new URL(document.referrer).origin
  } catch {
    return undefined
  }
}
