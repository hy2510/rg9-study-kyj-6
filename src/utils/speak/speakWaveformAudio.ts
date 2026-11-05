export function getAudioContextConstructor() {
  return (
    window.AudioContext ??
    (window as typeof window & {
      webkitAudioContext?: typeof AudioContext
    }).webkitAudioContext
  )
}

export async function decodeAudio(
  context: AudioContext,
  url: string,
): Promise<AudioBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Audio fetch failed: ${response.status}`)
  return context.decodeAudioData(await response.arrayBuffer())
}
