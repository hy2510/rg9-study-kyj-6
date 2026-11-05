export function playAudioBeforeContinue(
  soundUrl: string | undefined,
  onComplete: () => void,
) {
  if (!soundUrl) {
    onComplete()
    return
  }

  const audio = new Audio(soundUrl)
  let completed = false

  const finish = () => {
    if (completed) return
    completed = true
    audio.removeEventListener('ended', finish)
    audio.removeEventListener('error', finish)
    onComplete()
  }

  audio.addEventListener('ended', finish)
  audio.addEventListener('error', finish)
  audio.play().catch(finish)
}
