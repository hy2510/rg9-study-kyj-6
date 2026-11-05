/**
 * 원음(AudioBuffer) 캐시.
 * 같은 quiz 안에서 녹음을 반복해도 원음은 바뀌지 않으므로 fetch + decodeAudioData 비용을
 * 재녹음마다 반복할 필요가 없다. URL 을 키로 간단한 LRU(삽입순 제거) 캐시를 둔다.
 *
 * AudioBuffer 는 Web Audio 사양상 context 와 분리된 순수 데이터이므로 다른 context 에서
 * 생성되었더라도 `getChannelData()` 등으로 재사용 가능하다.
 */
const ORIGINAL_BUFFER_CACHE_LIMIT = 8
const originalBufferCache = new Map<string, AudioBuffer>()

export function getCachedOriginalBuffer(url: string): AudioBuffer | undefined {
  return originalBufferCache.get(url)
}

export function setCachedOriginalBuffer(
  url: string,
  buffer: AudioBuffer,
): void {
  if (originalBufferCache.has(url)) {
    originalBufferCache.delete(url)
  } else if (originalBufferCache.size >= ORIGINAL_BUFFER_CACHE_LIMIT) {
    const oldestKey = originalBufferCache.keys().next().value
    if (oldestKey !== undefined) originalBufferCache.delete(oldestKey)
  }
  originalBufferCache.set(url, buffer)
}
