import { useEffect, useRef } from 'react'

import { PageSequenceProps, PlayState } from '@src/interfaces/story/IStory'
import { getProgressPageForParent } from '@utils/story/storyPCHelpers'

type UseStoryParentCallbacksArgs = {
  /** 외부에서 책 오디오를 일시정지할 수 있도록 등록 */
  onRegisterPause?: (pause: () => void) => void
  pause: () => void

  /** 외부에서 책 오디오를 완전 정지(src 비우기 포함) 할 수 있도록 등록 */
  onRegisterStop?: (stop: () => void) => void
  stop: () => void

  /** 뷰가 숨겨지거나 무비 팝업이 열릴 때 자동 일시정지 */
  isVisible: boolean
  isMovieShow: boolean

  /**
   * 뷰 복귀 시 자동 재개 판단을 위한 현재 재생 상태.
   * (떠날 때 'play' 였으면 복귀 시 재개, 그 외는 중지 유지)
   */
  playState: PlayState
  /** 복귀 재개 시 pageSeq 재로드에 사용 */
  pageSeq: PageSequenceProps
  /** 복귀 재개 트리거 — pageSeq 를 새 참조로 교체해 loadAudio 재발화 */
  changeDuration: (page: number, seq: number) => void

  /** 진행률 변경 콜백 */
  onPageNumberChange?: (page: number) => void
  uniquePages: { Page: number }[]
  pageNumber: number
  singlePagePortrait: boolean
  spreadHalf: 0 | 1

  /** Auto-next 토글 상태 변경 콜백 + 토글 함수 등록 */
  onAutoNextChange?: (autoNext: boolean) => void
  isAutoNext: boolean
  onRegisterChangeAutoNextPage?: (toggle: (next: boolean) => void) => void
  changeAutoNextPage: (next: boolean) => void

  /** 재생 속도 변경 콜백 + 변경 함수 등록 */
  onPlaybackRateChange?: (rate: number) => void
  playbackRate: number
  onRegisterChangePlaybackRate?: (changeSpeed: (rate: number) => void) => void
  changePlaySpeed: (rate: number) => void
}

/**
 * `StoryPC` ↔ 부모 컨테이너 사이의 콜백/등록 효과를 한 곳에 모아 관리.
 * - pause 함수 등록
 * - 페이지 변경 시 부모 진행률 콜백 호출
 * - autoNext / playbackRate 상태 변화 콜백 + 토글/변경 함수 등록
 * - 뷰 숨김 / 무비 팝업 열림 시 자동 일시정지
 */
export default function useStoryParentCallbacks({
  onRegisterPause,
  pause,
  onRegisterStop,
  stop,
  isVisible,
  isMovieShow,
  playState,
  pageSeq,
  changeDuration,
  onPageNumberChange,
  uniquePages,
  pageNumber,
  singlePagePortrait,
  spreadHalf,
  onAutoNextChange,
  isAutoNext,
  onRegisterChangeAutoNextPage,
  changeAutoNextPage,
  onPlaybackRateChange,
  playbackRate,
  onRegisterChangePlaybackRate,
  changePlaySpeed,
}: UseStoryParentCallbacksArgs) {
  // 뷰 전환 시 재생 상태 스냅샷 저장 → 복귀 시 자동 재개 판단
  const playStateRef = useRef(playState)
  useEffect(() => {
    playStateRef.current = playState
  }, [playState])
  const pageSeqRef = useRef(pageSeq)
  useEffect(() => {
    pageSeqRef.current = pageSeq
  }, [pageSeq])

  const wasPlayingBeforeHideRef = useRef(false)
  const prevVisibleRef = useRef(isVisible)

  /**
   * 뷰 숨김/복귀 동작:
   * - true → false: 떠나기 전 재생 상태를 스냅샷, stop() 호출로 완전 정지(src 비움).
   *   → Story→Study/Speak 전환 시 잔류 재생 차단. 외부 등록 레이스와 무관하게 내부 player 를 직접 정지.
   * - false → true: 떠날 때 재생 중이었으면 pageSeq 재로드로 자동 재개(현재 페이지 유지).
   */
  useEffect(() => {
    const wasVisible = prevVisibleRef.current
    prevVisibleRef.current = isVisible

    if (wasVisible && !isVisible) {
      wasPlayingBeforeHideRef.current = playStateRef.current === 'play'
      stop()
      return
    }

    if (!wasVisible && isVisible && wasPlayingBeforeHideRef.current) {
      wasPlayingBeforeHideRef.current = false
      const { playPage, sequence } = pageSeqRef.current
      changeDuration(playPage, sequence)
    }
  }, [isVisible])

  // Movie Popup 은 복귀 가능하므로 pause (뷰 자체 숨김은 위에서 stop 처리됨)
  useEffect(() => {
    if (isVisible && isMovieShow) pause()
  }, [isVisible, isMovieShow])

  // 부모에게 pause 함수 등록
  useEffect(() => {
    onRegisterPause?.(pause)
  }, [onRegisterPause])

  // 부모에게 stop 함수 등록
  useEffect(() => {
    onRegisterStop?.(stop)
  }, [onRegisterStop])

  // 페이지 변경 → 부모 진행률 콜백 (최신 콜백을 ref로 보존)
  const onPageNumberChangeRef = useRef(onPageNumberChange)
  useEffect(() => {
    onPageNumberChangeRef.current = onPageNumberChange
  }, [onPageNumberChange])

  useEffect(() => {
    onPageNumberChangeRef.current?.(
      getProgressPageForParent(
        uniquePages,
        pageNumber,
        singlePagePortrait,
        spreadHalf,
      ),
    )
  }, [pageNumber, spreadHalf, singlePagePortrait, uniquePages])

  // autoNext 상태 변화 콜백 + 토글 함수 등록
  const onAutoNextChangeRef = useRef(onAutoNextChange)
  useEffect(() => {
    onAutoNextChangeRef.current = onAutoNextChange
  }, [onAutoNextChange])

  useEffect(() => {
    onAutoNextChangeRef.current?.(isAutoNext)
  }, [isAutoNext])

  useEffect(() => {
    onRegisterChangeAutoNextPage?.(changeAutoNextPage)
  }, [onRegisterChangeAutoNextPage, changeAutoNextPage])

  // playbackRate 상태 변화 콜백 + 변경 함수 등록
  const onPlaybackRateChangeRef = useRef(onPlaybackRateChange)
  useEffect(() => {
    onPlaybackRateChangeRef.current = onPlaybackRateChange
  }, [onPlaybackRateChange])

  useEffect(() => {
    onPlaybackRateChangeRef.current?.(playbackRate)
  }, [playbackRate])

  useEffect(() => {
    onRegisterChangePlaybackRate?.(changePlaySpeed)
  }, [onRegisterChangePlaybackRate, changePlaySpeed])
}
