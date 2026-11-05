type WorkerResponse = {
  id: number
  text?: string
  error?: string
}

type PendingRequest = {
  resolve: (text: string) => void
  reject: (error: Error) => void
}

let worker: Worker | undefined
let requestId = 0
const pendingRequests = new Map<number, PendingRequest>()
let warmupPromise: Promise<void> | undefined
let workerReady = false

function getWorker() {
  if (worker) return worker

  worker = new Worker(
    new URL('../workers/speakTranscription.worker.ts', import.meta.url),
    { type: 'module' },
  )
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const pending = pendingRequests.get(event.data.id)
    if (!pending) return
    pendingRequests.delete(event.data.id)
    if (event.data.error) {
      pending.reject(new Error(event.data.error))
      return
    }
    pending.resolve(event.data.text ?? '')
  }
  worker.onerror = (event) => {
    const error = new Error(event.message || 'Local speech analysis failed')
    pendingRequests.forEach(({ reject }) => reject(error))
    pendingRequests.clear()
  }
  return worker
}

function resampleAudio(audioBuffer: AudioBuffer, targetSampleRate: number) {
  const sourceLength = audioBuffer.length
  const monoSamples = new Float32Array(sourceLength)
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelSamples = audioBuffer.getChannelData(channel)
    for (let index = 0; index < sourceLength; index += 1) {
      monoSamples[index] += channelSamples[index] / audioBuffer.numberOfChannels
    }
  }

  if (audioBuffer.sampleRate === targetSampleRate) return monoSamples

  const targetLength = Math.max(
    1,
    Math.round((sourceLength * targetSampleRate) / audioBuffer.sampleRate),
  )
  const resampled = new Float32Array(targetLength)
  const ratio = audioBuffer.sampleRate / targetSampleRate
  for (let index = 0; index < targetLength; index += 1) {
    const sourcePosition = index * ratio
    const leftIndex = Math.floor(sourcePosition)
    const rightIndex = Math.min(leftIndex + 1, sourceLength - 1)
    const fraction = sourcePosition - leftIndex
    resampled[index] =
      (monoSamples[leftIndex] ?? 0) * (1 - fraction) +
      (monoSamples[rightIndex] ?? 0) * fraction
  }
  return resampled
}

export function warmupTranscriptionWorker(): Promise<void> {
  if (warmupPromise) return warmupPromise

  warmupPromise = new Promise<void>((resolve) => {
    const id = ++requestId
    pendingRequests.set(id, {
      resolve: () => { workerReady = true; resolve() },
      reject: () => { workerReady = true; resolve() },
    })
    getWorker().postMessage({ id, type: 'init' })
  })
  return warmupPromise
}

export function isTranscriptionWorkerReady(): boolean {
  return workerReady
}

export async function transcribeSpeakRecordingLocally(audio: Blob) {
  const context = new AudioContext()
  try {
    const decoded = await context.decodeAudioData(await audio.arrayBuffer())
    const samples = resampleAudio(decoded, 16_000)
    const id = ++requestId
    const transcription = new Promise<string>((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject })
    })
    getWorker().postMessage({ id, samples }, [samples.buffer])
    return await transcription
  } finally {
    await context.close()
  }
}

