import { useEffect, useState } from 'react'

import { getSpeakData } from '@services/speakApi'
import type { IStudyInfo } from '@src/interfaces/study/IStudyInfo'

/**
 * 현재 학습에 Speak 콘텐츠가 있는지 비동기로 조회한다.
 * - `isAvailableSpeaking` 이 false 이거나 세션 식별자가 없으면 바로 false.
 * - cancelled 플래그로 unmount 또는 study 변경 시 setState 를 가드한다.
 */
export default function useHasSpeakContent(
  studyInfo: IStudyInfo | undefined,
): boolean {
  const [hasSpeakContent, setHasSpeakContent] = useState(false)

  useEffect(() => {
    if (!studyInfo?.studyId || !studyInfo?.studentHistoryId) {
      setHasSpeakContent(false)
      return undefined
    }
    if (!studyInfo.isAvailableSpeaking) {
      setHasSpeakContent(false)
      return undefined
    }

    let cancelled = false

    const checkSpeakContent = async () => {
      try {
        const data = await getSpeakData({
          mode: studyInfo.mode,
          studyId: studyInfo.studyId,
          studentHistoryId: studyInfo.studentHistoryId,
        })

        if (!cancelled) setHasSpeakContent(data.length > 0)
      } catch {
        if (!cancelled) setHasSpeakContent(false)
      }
    }

    void checkSpeakContent()

    return () => {
      cancelled = true
    }
  }, [
    studyInfo?.mode,
    studyInfo?.studyId,
    studyInfo?.studentHistoryId,
    studyInfo?.isAvailableSpeaking,
  ])

  return hasSpeakContent
}
