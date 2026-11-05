export {}

declare global {
  interface Window {
    onFinishStudyResult: (
      id: number,
      cause: string | undefined,
      character: string,
    ) => void

    onExitStudy: () => void

    onLogoutStudy: () => void

    webkitAudioContext: typeof AudioContext

    LevelRoundId: string
  }
}
