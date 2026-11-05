const API_PREFIX = 'api/'
const TRIAL_API_PREFIX = 'api/trial/'

type TrialRef = { isGuide?: boolean; Mode?: string }

export function isTrialApiSession(): boolean {
  const REF = (window as Window & { REF?: TrialRef }).REF
  return REF?.isGuide === true || REF?.Mode === 'trial'
}

export function toTrialApiPath(path: string): string {
  if (!isTrialApiSession()) return path
  if (!path.startsWith(API_PREFIX) || path.startsWith(TRIAL_API_PREFIX)) {
    return path
  }
  return `${TRIAL_API_PREFIX}${path.slice(API_PREFIX.length)}`
}
