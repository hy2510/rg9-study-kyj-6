import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'

export type WritingRevisionMode = 'all' | 'free' | 'limit'

/**
 * WritingActivity2 의 `Writing.Mode`('All' | 'Free' | 'Limit')를
 * UI 에서 사용하는 소문자 모드로 변환한다. 값이 없으면 'all' 로 폴백.
 */
export function resolveWritingRevisionMode(
  mode?: IWritingActivity2['Writing']['Mode'],
): WritingRevisionMode {
  switch (mode) {
    case 'Free':
      return 'free'
    case 'Limit':
      return 'limit'
    case 'All':
    default:
      return 'all'
  }
}

/** 첨삭 모드 라벨의 i18n 키 (헤더 pill / 팝업 배지 공용) */
export function writingRevisionModeLabelKey(mode: WritingRevisionMode): string {
  return `study.writing.mode.${mode}`
}
