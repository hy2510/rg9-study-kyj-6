function createSentenceWithBlank(
  sentence: string,
  answerWord: string,
  placeholder = '___',
): string {
  return sentence.replace(answerWord, placeholder)
}

/** 레거시 퀴즈 정답/오답 효과음 재생 */
function playAudio(src: string): void {
  const audio = new Audio(src)
  void audio.play().catch(() => {})
}

export { createSentenceWithBlank, playAudio }
