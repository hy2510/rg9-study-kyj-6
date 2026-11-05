import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import MoviePopup from '@components/molecules/story/MoviePopup'
import Header from '@components/organisms/common/Header'
import StoryCompletePopup from '@components/organisms/story/StoryCompletePopup'
import StoryReadingModeBalloon from '@components/organisms/story/StoryReadingModeBalloon'
import StorySpeedBalloon from '@components/organisms/story/StorySpeedBalloon'
import VocaPreviewPopup from '@components/organisms/story/VocaPreviewPopup'
import {
  StoryBodyWrapper,
  StoryViewWrapper,
} from '@components/templates/story/StoryLayout'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import useHasSpeakContent from '@hooks/story/useHasSpeakContent'
import { useStoryVocabularyPractice } from '@hooks/story/useStoryVocabularyPractice'
import { ViewType } from '@interfaces/common/ViewType'
import {
  getStoryInfo,
  submitPreference,
  submitReadLastPage,
} from '@services/storyApi'
import StoryPC from '@src/components/templates/story/Story'
import { type StoryReadingProfile } from '@src/constants/story/storyReadingProfile'
import {
  getStoredStoryPlaybackRate,
  getStoryAutoNextFromStorage,
  loadStoryReadMode,
  saveStoryReadModePartial,
} from '@src/constants/story/storyReadModeStorage'
import { PageProps } from '@src/interfaces/story/IStory'
import { computeUniquePageTotal } from '@src/utils/story/computeUniquePageTotal'
import { flattenVocabularyPracticeToRows } from '@src/utils/story/flattenVocabularyPracticeRows'
import { isDodonfriendsHost } from '@utils/common/host'
import { exitStudyApp } from '@utils/exitStudy'
import {
  canEnterQuiz,
  getGoQuizDisabledMessageKey,
} from '@utils/study/entryPolicy'
import { getGuideParentOrigin } from '@utils/study/guideMode'

type StoryContainerProps = {
  changeCurrentView: (view: ViewType) => void
  isVisible: boolean
}

export default function StoryContainer({
  changeCurrentView,
  isVisible,
}: StoryContainerProps) {
  const { t } = useTranslation()
  const { bookInfo, studyInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps
  const { vocaData1, vocaData2, vocaData3, vocaData4 } =
    useStoryVocabularyPractice()
  const [storyData, setStoryData] = useState<PageProps[]>()
  const [isReadingComplete, setReadingComplete] = useState(
    bookInfo?.ReadingCompletedEB === 'Y' ? true : false,
  )
  const [isMovieShow, setIsMovieShow] = useState(false)
  const [isVocaShow, setIsVocaShow] = useState(false)
  const [isImagesLoaded, setIsImagesLoaded] = useState(false)
  const [isStoryCompletePopupOpen, setIsStoryCompletePopupOpen] =
    useState(false)
  const [storyReplaySeq, setStoryReplaySeq] = useState(0)
  const hasOpenedVocaPreviewRef = useRef(false)
  const pauseBookAudioRef = useRef<() => void>(() => {})
  const stopBookAudioRef = useRef<() => void>(() => {})
  const vocaAnchorRef = useRef<HTMLButtonElement>(null)
  const [storyPageNumber, setStoryPageNumber] = useState(1)
  const [isAutoNext, setIsAutoNext] = useState(getStoryAutoNextFromStorage)
  const changeAutoNextPageRef = useRef<(isAuto: boolean) => void>(() => {})
  const [playbackRate, setPlaybackRate] = useState(getStoredStoryPlaybackRate)
  const changePlaybackRateRef = useRef<(rate: number) => void>(() => {})
  const profileAnchorRef = useRef<HTMLButtonElement>(null)
  const [isProfileBalloonOpen, setIsProfileBalloonOpen] = useState(false)
  const hasSpeakContent = useHasSpeakContent(studyInfo)
  /**
   * 사용자가 하이라이트 도서에서 마지막으로 선택한 프로필(localStorage 저장).
   * 비하이라이트 도서 방문으로 인해 덮어써지지 않도록 실제 적용값(`readingProfile`)
   * 과 분리해 보관한다.
   */
  const [preferredProfile, setPreferredProfile] = useState<StoryReadingProfile>(
    () => loadStoryReadMode().readingProfile,
  )
  /**
   * 비하이라이트 도서(`HighlightDataYn === false`) 세션 내에서 사용자가 선택한 프로필.
   * `noHighlight`(기본) 또는 `noAudio` 두 가지만 유효하며 localStorage 에는 저장되지 않는다.
   */
  const [nonHighlightSessionProfile, setNonHighlightSessionProfile] =
    useState<StoryReadingProfile>('noHighlight')
  const speedAnchorRef = useRef<HTMLButtonElement>(null)
  const [isSpeedBalloonOpen, setIsSpeedBalloonOpen] = useState(false)
  const isSubmittingPreferenceRef = useRef<boolean>(false)

  useEffect(() => {
    saveStoryReadModePartial({ readingProfile: preferredProfile })
  }, [preferredProfile])

  // 도서가 바뀌면 비하이라이트 세션 프로필은 기본값으로 리셋
  useEffect(() => {
    setNonHighlightSessionProfile('noHighlight')
  }, [bookInfo?.BookId])

  /**
   * 실제 적용 프로필.
   * - 하이라이트 도서: 사용자 선호 그대로 사용
   * - 비하이라이트 도서(`HighlightDataYn === false`): 세션 내 선택값 사용(기본 `noHighlight`)
   *   → 사용자 선호(preferredProfile)는 보존되어 다음 하이라이트 도서 진입 시 복원된다.
   */
  const readingProfile: StoryReadingProfile =
    bookInfo?.HighlightDataYn === false
      ? nonHighlightSessionProfile
      : preferredProfile

  useEffect(() => {
    const getStoryData = async () => {
      const data = await getStoryInfo(
        studyInfo.studyId,
        studyInfo.studentHistoryId,
      )

      if (data) {
        setStoryData(data)
      }
    }

    if (!storyData) getStoryData()
  }, [storyData])

  const postReadingComplete = async () => {
    // 완독 상태 저장은 학생 학습 이력에만 반영되어야 한다.
    // preview / staff / review / guide 모드는 서버 기록을 남기지 않음.
    if (studyInfo.mode !== 'student') return
    const res = await submitReadLastPage(
      studyInfo.studyId,
      studyInfo.studentHistoryId,
    )
    if (res.success) {
      handler.markReadingCompletedEB()
    }
  }

  const storyPageTotal = useMemo(
    () => computeUniquePageTotal(storyData),
    [storyData],
  )

  const storyVocaKeywordRows = useMemo(
    () =>
      flattenVocabularyPracticeToRows(
        vocaData1,
        vocaData2,
        vocaData3,
        vocaData4,
      ),
    [vocaData1, vocaData2, vocaData3, vocaData4],
  )

  const hasVocaData = Boolean(vocaData1 || vocaData2 || vocaData3 || vocaData4)

  /**
   * dodonfriends.com(서브도메인 포함) 호스트 && 책 레벨 앞자리가 K/1 일 때만
   * Story 진입 시 Word Preview 를 자동 노출한다.
   */
  const shouldAutoOpenVocaPreview = useMemo(() => {
    const levelCode = bookInfo?.BookLevel?.trim().substring(0, 1).toUpperCase()
    return (
      isDodonfriendsHost() && (levelCode === 'K' || levelCode === '1')
    )
  }, [bookInfo?.BookLevel])

  useEffect(() => {
    if (
      !shouldAutoOpenVocaPreview ||
      !storyData ||
      !hasVocaData ||
      !isImagesLoaded ||
      hasOpenedVocaPreviewRef.current ||
      studyInfo?.isSubmitPreference
    )
      return

    hasOpenedVocaPreviewRef.current = true
    setIsSpeedBalloonOpen(false)
    setIsProfileBalloonOpen(false)
    setIsVocaShow(true)
  }, [
    shouldAutoOpenVocaPreview,
    hasVocaData,
    storyData,
    isImagesLoaded,
    studyInfo?.isSubmitPreference,
  ])

  useEffect(() => {
    if (isVocaShow) pauseBookAudioRef.current()
  }, [isVocaShow])

  useEffect(() => {
    if (!isVisible) stopBookAudioRef.current()
  }, [isVisible])

  /**
   * 별점은 항상 5점(=50) 고정 제출.
   * 추후 별점 선택 UI 가 도입되면 이 상수 대신 선택값을 사용한다.
   */
  const FIXED_PREFERENCE_VALUE = 50

  const ensurePreferenceSubmitted = useCallback(async (): Promise<boolean> => {
    if (studyInfo?.isSubmitPreference) return true
    if (isSubmittingPreferenceRef.current) return false
    isSubmittingPreferenceRef.current = true
    try {
      const res = await submitPreference(
        studyInfo.mode,
        studyInfo.studyId,
        studyInfo.studentHistoryId,
        FIXED_PREFERENCE_VALUE,
      )
      if (res.success) {
        handler.markPreferenceSubmitted()
        return true
      }
      return false
    } finally {
      isSubmittingPreferenceRef.current = false
    }
  }, [
    studyInfo?.isSubmitPreference,
    studyInfo.mode,
    studyInfo.studyId,
    studyInfo.studentHistoryId,
    handler,
  ])

  const navigateFromHeader = useCallback(
    async (view: ViewType) => {
      if (view !== 'Study') {
        // Speak 등 다른 뷰 전환 시에도 잔류 재생 즉시 차단
        stopBookAudioRef.current()
        changeCurrentView(view)
        return
      }
      // 별점 제출 네트워크 대기 중에도 스토리가 재생되지 않도록 선제 정지
      stopBookAudioRef.current()
      const ok = await ensurePreferenceSubmitted()
      if (!ok) return
      changeCurrentView('Study')
    },
    [changeCurrentView, ensurePreferenceSubmitted],
  )

  if (!storyData) return <CenteredLoading fillViewport />

  const headerProgress = Math.min(storyPageNumber, storyPageTotal)
  const movieUrl =
    typeof bookInfo.AnimationPath === 'string'
      ? bookInfo.AnimationPath.trim()
      : ''
  const hasMovieContent = movieUrl.length > 0

  const onVocaClick = () => {
    setIsSpeedBalloonOpen(false)
    setIsProfileBalloonOpen(false)
    setIsVocaShow((prev) => !prev)
  }

  const onSpeakClick = () => changeCurrentView('Speak')

  const onMovieClick = () => setIsMovieShow(true)

  const isGuideMode = studyInfo.mode === 'guide'
  const canShowSpeak = hasSpeakContent && !isGuideMode
  const isGoQuizDisabled =
    !canEnterQuiz(studyInfo, bookInfo) &&
    !((studyInfo.mode === 'trial' || isGuideMode) && isReadingComplete)

  const openStoryCompletePopup = () => {
    // Story Complete 팝업은 학습 전환의 분기점이므로 pause 가 아닌 stop 으로 완전 정지.
    // pause 만으로는 이후 `canplaythrough` 등 자동 재생 트리거에서 다시 재생될 수 있어
    // Study 화면에서 잔류 재생이 들리는 사례가 보고됨 → src 까지 비워 차단.
    stopBookAudioRef.current()
    void postReadingComplete()
    setReadingComplete(true)
    if (isGuideMode) {
      const origin = getGuideParentOrigin()
      window.parent.postMessage({ type: 'STORY_FINISHED' }, origin ?? '*')
    }
    setIsStoryCompletePopupOpen(true)
  }

  /**
   * Story Complete 팝업의 "퀴즈 풀기" 버튼 핸들러.
   * 별점 게이트 통과 시 팝업 닫고 Study 로 전환.
   *
   * preview 모드에서는 버튼이 시각적으로만 비활성화되고 클릭은 파이어되므로,
   * 여기서 안내 얼럿을 띄운 뒤 조기 return 한다.
   */
  const goStudyFromCompletePopup = async () => {
    if (studyInfo.mode === 'preview') {
      window.alert(t('story.previewCannotStudy'))
      return
    }
    const ok = await ensurePreferenceSubmitted()
    if (!ok) return
    // openStoryCompletePopup 에서 1차 stop 호출됨 — 팝업 체류 중 재생 재개 가능성 대비 safety (idempotent)
    stopBookAudioRef.current()
    setIsStoryCompletePopupOpen(false)
    changeCurrentView('Study')
  }

  const handleReadAgain = () => {
    setIsStoryCompletePopupOpen(false)
    setIsMovieShow(false)
    setIsVocaShow(false)
    setStoryPageNumber(1)
    setStoryReplaySeq((seq) => seq + 1)
  }

  const watchMovieFromCompletePopup = () => {
    setIsStoryCompletePopupOpen(false)
    setIsMovieShow(true)
  }

  const goSpeakFromCompletePopup = () => {
    setIsStoryCompletePopupOpen(false)
    changeCurrentView('Speak')
  }

  const exitStudyFromCompletePopup = exitStudyApp

  const onAutoNextToggle = () => changeAutoNextPageRef.current(!isAutoNext)

  const onProfileBalloonToggle = () => {
    setIsVocaShow(false)
    setIsSpeedBalloonOpen(false)
    setIsProfileBalloonOpen((prev) => !prev)
  }

  const onSpeedBalloonToggle = () => {
    setIsVocaShow(false)
    setIsProfileBalloonOpen(false)
    setIsSpeedBalloonOpen((prev) => !prev)
  }

  const toggleMovieShow = (isShow: boolean) => setIsMovieShow(isShow)

  const registerPauseBookAudio = (fn: () => void) => {
    pauseBookAudioRef.current = fn
    if (isVocaShow) fn()
  }

  const registerStopBookAudio = (fn: () => void) => {
    stopBookAudioRef.current = fn
  }

  const registerChangeAutoNextPage = (fn: (next: boolean) => void) => {
    changeAutoNextPageRef.current = fn
  }

  const registerChangePlaybackRate = (fn: (rate: number) => void) => {
    changePlaybackRateRef.current = fn
  }

  const closeProfileBalloon = () => setIsProfileBalloonOpen(false)
  const closeSpeedBalloon = () => setIsSpeedBalloonOpen(false)
  const closeVocaBalloon = () => setIsVocaShow(false)
  const closeMovie = () => setIsMovieShow(false)

  const pauseBookAudio = () => pauseBookAudioRef.current()

  const handleSelectReadingProfile = (p: StoryReadingProfile) => {
    // 비하이라이트 도서에서는 세션 상태만 변경(localStorage 미저장)해 원래 선호 보존.
    if (bookInfo?.HighlightDataYn === false) {
      setNonHighlightSessionProfile(p)
      return
    }
    setPreferredProfile(p)
  }

  const handleSelectPlaybackRate = (rate: number) =>
    changePlaybackRateRef.current(rate)

  return (
    <StoryViewWrapper>
      <Header
        variant='story'
        bookCode={bookInfo?.BookCode ?? ''}
        bookTitle={bookInfo?.Title}
        keywords={bookInfo?.Keywords}
        changeCurrentView={navigateFromHeader}
        closeMenuSignal={isVocaShow}
        progress={headerProgress}
        total={storyPageTotal}
        onVocaClick={onVocaClick}
        onSpeakClick={canShowSpeak ? onSpeakClick : undefined}
        onMovieClick={hasMovieContent ? onMovieClick : undefined}
        onReadAgainClick={handleReadAgain}
        vocaAnchorRef={vocaAnchorRef}
        isAutoNext={isAutoNext}
        onAutoNextToggle={onAutoNextToggle}
        readingProfile={readingProfile}
        profileAnchorRef={profileAnchorRef}
        isProfileBalloonOpen={isProfileBalloonOpen}
        onProfileBalloonToggle={onProfileBalloonToggle}
        playbackRate={playbackRate}
        speedAnchorRef={speedAnchorRef}
        isSpeedBalloonOpen={isSpeedBalloonOpen}
        onSpeedBalloonToggle={onSpeedBalloonToggle}
        storyVocaKeywordRows={storyVocaKeywordRows}
        storyVocabularyPrintUrl={bookInfo?.VocabularyPath}
        pauseBookAudio={pauseBookAudio}
        isGoQuizDisabled={isGoQuizDisabled}
        goQuizDisabledMessageKey={getGoQuizDisabledMessageKey(studyInfo)}
      />
      <StoryBodyWrapper>
        {isVocaShow && (
          <VocaPreviewPopup
            bookLevel={bookInfo?.BookLevel}
            bookType={studyInfo.bookType}
            onClose={closeVocaBalloon}
            pauseBookAudio={pauseBookAudio}
            vocaData1={vocaData1}
            vocaData2={vocaData2}
            vocaData3={vocaData3}
            vocaData4={vocaData4}
          />
        )}
        <StoryContent>
          <StoryPC
            key={storyReplaySeq}
            bookLevel={bookInfo?.BookLevel?.substring(0, 1) ?? 'K'}
            studyId={studyInfo.studyId}
            studentHistoryId={studyInfo.studentHistoryId}
            isEbAnotherSizeYn={studyInfo.isEbAnotherSizeYn}
            isMovieShow={isMovieShow || isVocaShow || isStoryCompletePopupOpen}
            storyData={storyData}
            toggleMovieShow={toggleMovieShow}
            isReadingComplete={isReadingComplete}
            changeReadingComplete={postReadingComplete}
            isVisible={isVisible}
            onRegisterPause={registerPauseBookAudio}
            onRegisterStop={registerStopBookAudio}
            onPageNumberChange={setStoryPageNumber}
            onRegisterChangeAutoNextPage={registerChangeAutoNextPage}
            onAutoNextChange={setIsAutoNext}
            onPlaybackRateChange={setPlaybackRate}
            onRegisterChangePlaybackRate={registerChangePlaybackRate}
            onFinalNext={openStoryCompletePopup}
            onImagesLoaded={() => setIsImagesLoaded(true)}
            readingProfile={readingProfile}
            hasHighlightData={bookInfo?.HighlightDataYn === true}
          />
        </StoryContent>
      </StoryBodyWrapper>
      {isProfileBalloonOpen && (
        <StoryReadingModeBalloon
          isOpen={isProfileBalloonOpen}
          onClose={closeProfileBalloon}
          anchorRef={profileAnchorRef}
          layoutTrigger={true}
          readingProfile={readingProfile}
          onSelectProfile={handleSelectReadingProfile}
          hasHighlightData={bookInfo?.HighlightDataYn === true}
        />
      )}
      {isSpeedBalloonOpen && (
        <StorySpeedBalloon
          isOpen={isSpeedBalloonOpen}
          onClose={closeSpeedBalloon}
          anchorRef={speedAnchorRef}
          layoutTrigger={true}
          playbackRate={playbackRate}
          onSelectRate={handleSelectPlaybackRate}
        />
      )}
      {isMovieShow && hasMovieContent && (
        <MoviePopup url={movieUrl} onClose={closeMovie} />
      )}
      {isStoryCompletePopupOpen && (
        <StoryCompletePopup
          hasMovie={hasMovieContent}
          hasSpeak={studyInfo.mode === 'preview' ? false : canShowSpeak}
          isGoQuizDisabled={isGoQuizDisabled}
          onClose={() => setIsStoryCompletePopupOpen(false)}
          onGoQuiz={goStudyFromCompletePopup}
          onReadAgain={handleReadAgain}
          onWatchMovie={watchMovieFromCompletePopup}
          onSpeakPractice={goSpeakFromCompletePopup}
          onExitStudy={exitStudyFromCompletePopup}
        />
      )}
    </StoryViewWrapper>
  )
}

const StoryContent = styled.div`
  width: 100%;
  height: 100%;
`
