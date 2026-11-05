import { createContext, useContext } from 'react'

/**
 * 학습 컨테이너가 현재 뷰포트에서 보이고 있는지 여부.
 *
 * `InfoContainer` 가 Story ↔ Study 전환 시 `LegacyStudyContainer` 등을
 * 언마운트하지 않고 visibility/opacity 만 토글하므로, 활동 컴포넌트 및
 * 자식 훅(예: `useStudyAudio`)이 실제 사용자 노출 여부를 알아야 하는 경우
 * 이 컨텍스트를 구독한다.
 */
export const StudyVisibilityContext = createContext<boolean>(true)

export function useStudyVisibility(): boolean {
  return useContext(StudyVisibilityContext)
}
