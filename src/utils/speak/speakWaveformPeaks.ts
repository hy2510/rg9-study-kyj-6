// 뷰포트 가로 픽셀과 동일한 해상도로 샘플링해 발화 위치를 세밀하게 맞춘다.
export const WAVEFORM_BINS = 720
export const VIEWBOX_WIDTH = 720
export const VIEWBOX_HEIGHT = 128
export const WAVEFORM_BASELINE_Y = VIEWBOX_HEIGHT - 8
export const WAVEFORM_HEIGHT = VIEWBOX_HEIGHT - 16

export type WaveformData = {
  original: number[]
  user: number[]
  originalDuration: number
  userDuration: number
}

/**
 * 녹음 blob 뒤쪽 무음(silence) 영역을 제외한 "실제 소리 끝 지점" 까지의 duration 을 반환.
 * MediaRecorder 가 maxDurationMs 전체를 녹음해 뒤가 무음으로 채워진 경우에도
 * 파형을 SVG 폭 전체에 넓게 분산해 그릴 수 있도록 샘플링 범위를 좁히는 데 사용.
 */
export function getSoundDuration(
  buffer: AudioBuffer,
  threshold = 0.005,
): number {
  const channelCount = buffer.numberOfChannels
  const length = buffer.length
  for (let sampleIndex = length - 1; sampleIndex >= 0; sampleIndex--) {
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
      const sample = buffer.getChannelData(channelIndex)[sampleIndex] ?? 0
      if (Math.abs(sample) > threshold) {
        return (sampleIndex + 1) / buffer.sampleRate
      }
    }
  }
  return buffer.duration
}

export function extractPeaks(
  buffer: AudioBuffer,
  timelineDuration: number,
): number[] {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index),
  )

  return Array.from({ length: WAVEFORM_BINS }, (_, binIndex) => {
    const startTime = (binIndex / WAVEFORM_BINS) * timelineDuration
    const endTime = ((binIndex + 1) / WAVEFORM_BINS) * timelineDuration
    if (startTime >= buffer.duration) return 0

    const startSample = Math.floor(startTime * buffer.sampleRate)
    const endSample = Math.min(
      buffer.length,
      Math.max(startSample + 1, Math.ceil(endTime * buffer.sampleRate)),
    )
    let sumOfSquares = 0
    let sampleCount = 0

    for (const channel of channels) {
      for (let sampleIndex = startSample; sampleIndex < endSample; sampleIndex++) {
        const sample = channel[sampleIndex] ?? 0
        sumOfSquares += sample * sample
        sampleCount += 1
      }
    }
    return sampleCount > 0 ? Math.sqrt(sumOfSquares / sampleCount) : 0
  })
}

export function smoothPeaks(peaks: number[], radius = 6): number[] {
  return peaks.map((_, index) => {
    let weightedSum = 0
    let weightTotal = 0
    const start = Math.max(0, index - radius)
    const end = Math.min(peaks.length - 1, index + radius)

    for (let nearbyIndex = start; nearbyIndex <= end; nearbyIndex++) {
      const distance = Math.abs(nearbyIndex - index)
      const weight = radius + 1 - distance
      weightedSum += (peaks[nearbyIndex] ?? 0) * weight
      weightTotal += weight
    }
    return weightTotal > 0 ? weightedSum / weightTotal : 0
  })
}

export function normalizeTogether(data: WaveformData): WaveformData {
  const maxPeak = Math.max(0.001, ...data.original, ...data.user)
  return {
    original: smoothPeaks(data.original.map((peak) => peak / maxPeak)),
    user: smoothPeaks(data.user.map((peak) => peak / maxPeak)),
    originalDuration: data.originalDuration,
    userDuration: data.userDuration,
  }
}

export function makeWavePath(peaks: number[]): string {
  if (peaks.length === 0) return ''
  const xStep = VIEWBOX_WIDTH / Math.max(1, peaks.length - 1)
  const points = peaks.map((peak, index) => ({
    x: index * xStep,
    y: WAVEFORM_BASELINE_Y - peak * WAVEFORM_HEIGHT,
  }))
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return ''

  const curve = [`M ${first.x} ${first.y}`]
  for (let index = 1; index < points.length - 1; index++) {
    const point = points[index]
    const next = points[index + 1]
    if (!point || !next) continue
    curve.push(
      `Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`,
    )
  }
  curve.push(`Q ${last.x} ${last.y} ${last.x} ${last.y}`)
  return `${curve.join(' ')} L ${VIEWBOX_WIDTH} ${WAVEFORM_BASELINE_Y} L 0 ${WAVEFORM_BASELINE_Y} Z`
}
