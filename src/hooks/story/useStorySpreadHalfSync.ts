import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type StoryPageEntry = { Page: number; SoundPath?: string }

type UseStorySpreadHalfSyncArgs = {
  isSpeakMode: boolean
  singlePagePortrait: boolean
  pageNumber: number
  leftPage: { Page: number } | undefined
  rightPage: { Page: number } | undefined
  pageSeqPlayPage: number
  changeDuration: (page: number, time: number) => void
  storyData: StoryPageEntry[]
}

/**
 * 세로 한 장 모드(`singlePagePortrait`)에서의 spread half(0=왼쪽, 1=오른쪽) 동기화.
 *
 * 세 가지 효과를 묶어 관리:
 * 1. 세로↔가로 전환 시 audio playPage 보존
 * 2. spread/페이지/playPage 변화에 따른 spreadHalf 동기화 + audio 동기화 (layout effect)
 * 3. portrait에서 prev spread 직후 audio 훅이 왼쪽으로 두는 것을 오른쪽으로 보정
 *
 * 외부에서 mutate가 필요한 두 신호는 imperative 함수로 노출:
 * - `markPortraitAfterPrev()` — prev 동작 직후 spreadHalf=1로 강제 동기화
 * - `markRightPlayNeededAfterPrev()` — prev 동작 직후 playPage를 오른쪽으로 보정 필요
 */
export default function useStorySpreadHalfSync({
  isSpeakMode,
  singlePagePortrait,
  pageNumber,
  leftPage,
  rightPage,
  pageSeqPlayPage,
  changeDuration,
  storyData,
}: UseStorySpreadHalfSyncArgs) {
  const [spreadHalf, setSpreadHalf] = useState<0 | 1>(0)

  const portraitAfterPrevRef = useRef(false)
  /** 세로 한 장에서 스프레드 뒤로 간 직후: 오디오 훅이 playPage를 왼쪽으로 두면 half 동기화가 spreadHalf를 0으로 되돌려 한 장 건너뜀 → 한 번만 막고 effect에서 play를 오른쪽으로 맞춤 */
  const portraitPrevSpreadNeedRightPlayRef = useRef(false)
  const prevSinglePagePortraitRef = useRef(singlePagePortrait)

  const prevSpreadSyncPortraitRef = useRef(false)
  const prevSpreadSyncPageRef = useRef(pageNumber)
  const prevLayoutPlayPageRef = useRef(pageSeqPlayPage)

  const markPortraitAfterPrev = useCallback(() => {
    portraitAfterPrevRef.current = true
  }, [])

  const markRightPlayNeededAfterPrev = useCallback(() => {
    portraitPrevSpreadNeedRightPlayRef.current = true
  }, [])

  /** 세로↔가로: 가로로 돌릴 때 현재 playPage가 스프레드 안이면 음원 유지(재로드 안 함) */
  useEffect(() => {
    if (isSpeakMode) return
    const wasPortrait = prevSinglePagePortraitRef.current
    prevSinglePagePortraitRef.current = singlePagePortrait

    if (singlePagePortrait) {
      return
    }

    if (wasPortrait && !singlePagePortrait) {
      const leftP = leftPage?.Page
      const rightP = rightPage?.Page
      const pp = pageSeqPlayPage
      if (pp === leftP || (rightP != null && pp === rightP)) {
        return
      }
      const anchor = pageNumber
      const hasSoundLeft = storyData.some(
        (data) => data.Page === anchor && data.SoundPath,
      )
      changeDuration(hasSoundLeft ? anchor : anchor + 1, 0)
    }
  }, [
    changeDuration,
    isSpeakMode,
    leftPage?.Page,
    pageNumber,
    pageSeqPlayPage,
    rightPage?.Page,
    singlePagePortrait,
    storyData,
  ])

  useLayoutEffect(() => {
    if (isSpeakMode) return

    const playPageChanged = pageSeqPlayPage !== prevLayoutPlayPageRef.current

    let halfForAudio: 0 | 1 = spreadHalf

    try {
      if (portraitAfterPrevRef.current) {
        portraitAfterPrevRef.current = false
        halfForAudio = 1
        setSpreadHalf(1)
        prevSpreadSyncPortraitRef.current = singlePagePortrait
        prevSpreadSyncPageRef.current = pageNumber
      } else {
        const portraitEntered =
          singlePagePortrait && !prevSpreadSyncPortraitRef.current
        const spreadChangedWhilePortrait =
          singlePagePortrait && pageNumber !== prevSpreadSyncPageRef.current

        prevSpreadSyncPortraitRef.current = singlePagePortrait
        prevSpreadSyncPageRef.current = pageNumber

        if (!singlePagePortrait) {
          setSpreadHalf(0)
          return
        }
        if (!leftPage) {
          setSpreadHalf(0)
          return
        }

        if (portraitEntered || spreadChangedWhilePortrait) {
          const rightP = rightPage?.Page
          const pp = pageSeqPlayPage
          const want: 0 | 1 = rightP != null && pp === rightP ? 1 : 0
          halfForAudio = want
          setSpreadHalf(want)
        } else if (
          singlePagePortrait &&
          leftPage &&
          rightPage &&
          playPageChanged
        ) {
          const lp = leftPage.Page
          const rp = rightPage.Page
          if (pageSeqPlayPage === rp && spreadHalf === 0) {
            halfForAudio = 1
            setSpreadHalf(1)
          } else if (
            pageSeqPlayPage === lp &&
            spreadHalf === 1 &&
            !portraitPrevSpreadNeedRightPlayRef.current
          ) {
            halfForAudio = 0
            setSpreadHalf(0)
          }
        }
      }

      if (singlePagePortrait && leftPage) {
        const visibleP =
          halfForAudio === 0 ? leftPage.Page : (rightPage ?? leftPage).Page
        if (pageSeqPlayPage !== visibleP) {
          changeDuration(visibleP, 0)
        }
      }
    } finally {
      prevLayoutPlayPageRef.current = pageSeqPlayPage
    }
  }, [
    changeDuration,
    isSpeakMode,
    leftPage,
    pageNumber,
    pageSeqPlayPage,
    rightPage,
    singlePagePortrait,
    spreadHalf,
  ])

  /** `useStoryAudioPC`의 [pageNumber] effect가 layout 이후에 playPage를 왼쪽으로 두는 경우, 오른쪽 장 표시와 맞춤 */
  useEffect(() => {
    if (!portraitPrevSpreadNeedRightPlayRef.current) return
    if (!singlePagePortrait || !rightPage) {
      portraitPrevSpreadNeedRightPlayRef.current = false
      return
    }
    const rp = rightPage.Page
    if (pageSeqPlayPage !== rp) {
      changeDuration(rp, 0)
    }
    portraitPrevSpreadNeedRightPlayRef.current = false
  }, [
    changeDuration,
    pageNumber,
    pageSeqPlayPage,
    rightPage,
    singlePagePortrait,
  ])

  return {
    spreadHalf,
    setSpreadHalf,
    markPortraitAfterPrev,
    markRightPlayNeededAfterPrev,
  }
}
