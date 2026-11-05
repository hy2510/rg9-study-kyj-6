import {
  type AutomaticSpeechRecognitionOutput,
  type AutomaticSpeechRecognitionPipeline,
  env,
  pipeline,
} from '@huggingface/transformers'

const assetBaseUrl = new URL(import.meta.env.BASE_URL, self.location.origin)

env.allowLocalModels = true
env.allowRemoteModels = false
env.localModelPath = new URL('models/', assetBaseUrl).href
const wasmBackend = env.backends.onnx.wasm
if (!wasmBackend) throw new Error('ONNX WASM backend is unavailable')
wasmBackend.wasmPaths = new URL('transformers-wasm/', assetBaseUrl).href

type Transcriber = AutomaticSpeechRecognitionPipeline

let transcriberPromise: Promise<Transcriber> | undefined

function getTranscriber() {
  transcriberPromise ??= (
    pipeline as unknown as (
      task: 'automatic-speech-recognition',
      model: string,
      options: { device: 'wasm'; dtype: 'q8' },
    ) => Promise<Transcriber>
  )('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
    device: 'wasm',
    dtype: 'q8',
  })
  return transcriberPromise
}

self.onmessage = async (
  event: MessageEvent<{ id: number; samples?: Float32Array; type?: 'init' }>,
) => {
  const { id, samples, type } = event.data

  if (type === 'init') {
    try {
      await getTranscriber()
    } catch {
      // ignore
    }
    self.postMessage({ id })
    return
  }

  if (!samples) return

  try {
    const transcriber = await getTranscriber()
    const output = await transcriber(samples)
    const result = Array.isArray(output)
      ? (output[0] as AutomaticSpeechRecognitionOutput | undefined)
      : output
    const text = result?.text
    self.postMessage({ id, text: text?.trim() ?? '' })
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
