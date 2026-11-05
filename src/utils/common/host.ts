/**
 * 현재 페이지 호스트 또는 iframe 임베드 시 부모(referrer) 호스트가
 * `dodonfriends.com`(서브도메인 포함)에 해당하는지 판별한다.
 */
export function isDodonfriendsHost(): boolean {
  const match = (host?: string | null) =>
    typeof host === 'string' && /(^|\.)dodonfriends\.com$/i.test(host)

  if (typeof window === 'undefined') return false
  if (match(window.location.hostname)) return true

  try {
    if (document.referrer) {
      return match(new URL(document.referrer).hostname)
    }
  } catch {
    // malformed referrer 는 무시
  }
  return false
}
