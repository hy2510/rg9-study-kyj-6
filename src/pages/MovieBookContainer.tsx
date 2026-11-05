import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import MovieBookHeader from '@components/organisms/common/MovieBookHeader'
import StoryCompletePopup from '@components/organisms/story/StoryCompletePopup'
import VocaPreviewPopup from '@components/organisms/story/VocaPreviewPopup'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useStoryVocabularyPractice } from '@hooks/story/useStoryVocabularyPractice'
import { ViewType } from '@interfaces/common/ViewType'
import { getSpeakData } from '@services/speakApi'
import { submitPreference, submitReadLastPage } from '@services/storyApi'
import { flattenVocabularyPracticeToRows } from '@utils/story/flattenVocabularyPracticeRows'
import {
  canEnterQuiz,
  getGoQuizDisabledMessageKey,
} from '@utils/study/entryPolicy'
import { getGuideParentOrigin } from '@utils/study/guideMode'

type MovieBookContainerProps = {
  changeCurrentView: (view: ViewType) => void
  isVisible: boolean
}

export default function MovieBookContainer({
  changeCurrentView,
  isVisible,
}: MovieBookContainerProps) {
  const { t } = useTranslation()
  const { bookInfo, studyInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps

  const { vocaData1, vocaData2, vocaData3, vocaData4 } =
    useStoryVocabularyPractice()

  const vocaRows = useMemo(
    () =>
      flattenVocabularyPracticeToRows(
        vocaData1,
        vocaData2,
        vocaData3,
        vocaData4,
      ),
    [vocaData1, vocaData2, vocaData3, vocaData4],
  )

  const keywordList = useMemo(
    () =>
      (bookInfo?.Keywords ?? '')
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [bookInfo?.Keywords],
  )

  const hasVocaData = Boolean(vocaData1 || vocaData2 || vocaData3 || vocaData4)

  const [hasSpeakContent, setHasSpeakContent] = useState(false)
  const [isVocaShow, setIsVocaShow] = useState(false)
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false)
  const [isReadingComplete, setIsReadingComplete] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const isSubmittingPreferenceRef = useRef<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoUrl =
    typeof bookInfo?.MovieBookPath === 'string'
      ? bookInfo.MovieBookPath.trim()
      : ''

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

  useEffect(() => {
    if (isVocaShow) videoRef.current?.pause()
  }, [isVocaShow])

  const pauseVideo = () => videoRef.current?.pause()

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

  const FIXED_PREFERENCE_VALUE = 50

  const ensurePreferenceSubmitted = async (): Promise<boolean> => {
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
  }

  const isGuideMode = studyInfo?.mode === 'guide'
  const canShowSpeak = hasSpeakContent && !isGuideMode

  const handleVideoEnded = () => {
    void postReadingComplete()
    setIsReadingComplete(true)
    if (isGuideMode) {
      const origin = getGuideParentOrigin()
      window.parent.postMessage({ type: 'STORY_FINISHED' }, origin ?? '*')
    }
    setIsCompletePopupOpen(true)
  }

  /**
   * preview 모드에서는 완독 팝업의 "퀴즈 풀기" 버튼이 시각적으로만 비활성화되며
   * 클릭은 파이어되므로, 여기서 안내 얼럿을 띄운 뒤 조기 return 한다.
   */
  const goStudyFromCompletePopup = async () => {
    if (studyInfo?.mode === 'preview') {
      window.alert(t('story.previewCannotStudy'))
      return
    }
    const ok = await ensurePreferenceSubmitted()
    if (!ok) return
    setIsCompletePopupOpen(false)
    changeCurrentView('Study')
  }

  const replayFromCompletePopup = () => {
    setIsCompletePopupOpen(false)
    setReplayKey((k) => k + 1)
  }

  const goSpeakFromCompletePopup = () => {
    setIsCompletePopupOpen(false)
    changeCurrentView('Speak')
  }

  const exitStudy = () => {
    const onExitStudy = (window as Window & { onExitStudy?: () => void })
      .onExitStudy
    if (onExitStudy) {
      onExitStudy()
      return
    }
    window.location.href = '/'
  }

  const isGoQuizDisabled =
    !canEnterQuiz(studyInfo, bookInfo) &&
    !((studyInfo?.mode === 'trial' || isGuideMode) && isReadingComplete)

  return (
    <Wrapper $visible={isVisible}>
      <MovieBookHeader
        bookCode={bookInfo?.BookCode ?? ''}
        bookTitle={bookInfo?.Title}
        isGoQuizDisabled={isGoQuizDisabled}
        goQuizDisabledMessageKey={getGoQuizDisabledMessageKey(studyInfo)}
        hasSpeakContent={canShowSpeak}
        keywordList={keywordList}
        vocaRows={vocaRows}
        vocabularyPrintUrl={bookInfo?.VocabularyPath}
        onGoQuiz={goStudyFromCompletePopup}
        onSpeakPractice={goSpeakFromCompletePopup}
        onExitStudy={exitStudy}
      />
      {isVocaShow && (
        <VocaPreviewPopup
          bookLevel={bookInfo?.BookLevel}
          onClose={() => setIsVocaShow(false)}
          pauseBookAudio={pauseVideo}
          vocaData1={vocaData1}
          vocaData2={vocaData2}
          vocaData3={vocaData3}
          vocaData4={vocaData4}
        />
      )}
      <VideoArea>
        {videoUrl ? (
          <VideoPlayer
            ref={videoRef}
            key={replayKey}
            src={videoUrl}
            controls
            controlsList='nodownload'
            autoPlay
            onEnded={handleVideoEnded}
          />
        ) : null}
      </VideoArea>
      {isCompletePopupOpen && (
        <StoryCompletePopup
          hasMovie={false}
          hasSpeak={studyInfo?.mode === 'preview' ? false : canShowSpeak}
          isGoQuizDisabled={isGoQuizDisabled}
          onClose={() => setIsCompletePopupOpen(false)}
          onGoQuiz={goStudyFromCompletePopup}
          onReadAgain={replayFromCompletePopup}
          onWatchMovie={() => {}}
          onSpeakPractice={goSpeakFromCompletePopup}
          onExitStudy={exitStudy}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  visibility: ${(p) => (p.$visible ? 'visible' : 'hidden')};
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
`

const VideoArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
`

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`
