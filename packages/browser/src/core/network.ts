import {
  type RMBGModel,
  type RMBGONNX,
  defaultONNXPublicPath,
  defaultONNXWasms
} from './config'

export async function loadResponse(
  response: Response,
  onProgress: (length: number) => void
): Promise<Uint8Array[]> {
  if (response.body === null) {
    return []
  }
  let receivedLength = 0
  const chunks: Uint8Array[] = []
  const reader = response.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    receivedLength += value.length
    onProgress(receivedLength)
  }
  return chunks
}

export async function loadFile(
  name: string,
  files: string[],
  mime: string,
  size: number,
  abortController?: AbortController,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const controllers: Record<number, AbortController | undefined> = {}
  let aborted = false
  const abort = (): void => {
    if (!aborted) {
      aborted = true
      if (abortController?.signal.aborted === false) {
        abortController?.abort()
      }
      files.forEach((_, index) => {
        controllers[index]?.abort()
        controllers[index] = undefined
      })
    }
  }
  abortController?.signal.addEventListener('abort', abort)

  const loaded: number[] = Array(files.length)
  const chunks = await Promise.all(
    files.map(async (url, index) => {
      try {
        const controller =
          typeof AbortController !== 'undefined'
            ? new AbortController()
            : undefined
        if (controller !== undefined) {
          controllers[index] = controller
        }
        loaded[index] = 0
        const response = await fetch(url, {
          signal: controller?.signal
        })
        const result = await (onProgress !== undefined
          ? new Blob(
              await loadResponse(response, (length) => {
                loaded[index] = length
                onProgress?.(loaded.reduce((rcc, item) => rcc + item, 0) / size)
              })
            ).arrayBuffer()
          : (await response.blob()).arrayBuffer())

        controllers[index] = undefined
        return result
      } catch (error) {
        abort()
        throw error
      }
    })
  )

  const data = new Blob(chunks, { type: mime })
  if (data.size !== size) {
    throw new Error(
      `Failed to fetch ${name}  with size ${size} but got ${data.size}`
    )
  }
  return data
}

export async function loadModel(
  model: RMBGModel,
  abortController?: AbortController,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const file = await loadFile(
    model.name,
    model.files.map((file) => model.publicPath + file),
    model.mime,
    model.size,
    abortController,
    onProgress
  )
  return file
}

export const loadWASM = async (
  { publicPath = defaultONNXPublicPath, wasms = defaultONNXWasms }: RMBGONNX,
  abortController?: AbortController,
  onProgress?: (progress: number) => void
): Promise<Array<[string, Blob]>> => {
  const loaded: number[] = Array(wasms.length)
  const totalSize = wasms.reduce((rcc, item) => rcc + item.size, 0)
  const result = await Promise.all(
    wasms.map(async (wasm, index) => {
      loaded[index] = 0
      const ratio = wasm.size / totalSize
      const file = await loadFile(
        wasm.name,
        wasm.files.map((file) => publicPath + file),
        wasm.mime,
        wasm.size,
        abortController,
        onProgress !== undefined
          ? (progress: number) => {
              loaded[index] = progress
              onProgress?.(loaded.reduce((rcc, item) => rcc + item * ratio, 0))
            }
          : undefined
      ).catch(async (error) => {
        throw error
      })
      return [wasm.name, file] as [string, Blob]
    })
  )
  return result
}
