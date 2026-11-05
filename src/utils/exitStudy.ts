export function exitStudyApp() {
  try {
    ;(window as Window & { onExitStudy?: () => void }).onExitStudy?.()
  } catch {
    window.location.href = '/'
  }
}
