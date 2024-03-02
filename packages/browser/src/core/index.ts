import { simd, threads } from 'wasm-feature-detect'
import * as ort from 'onnxruntime-web'
import {
  type ImageSource,
  type RMBGOptions,
  defaultONNX,
  defaultMaxResolution
} from './config'
import { loadModel, loadWASM } from './network'
import {
  imageSourceToImageData,
  imageDataResize,
  imageDataToFloat32Array,
  calculateProportionalSize,
  imageDataToBlob
} from './utils'

export type { ImageSource, RMBGOptions, defaultONNX, defaultMaxResolution }

export async function rmbg(
  image: ImageSource,
  {
    model,
    onnx = defaultONNX,
    maxResolution = defaultMaxResolution,
    abortController,
    onProgress
  }: RMBGOptions
): Promise<Blob> {
  // abort controller
  const wasmLoadController = new AbortController()
  const modelLoadController = new AbortController()
  let processInterval: ReturnType<typeof setInterval> | null = null
  abortController?.signal.addEventListener('abort', () => {
    wasmLoadController.abort()
    modelLoadController.abort()
    if (processInterval) {
      clearInterval(processInterval)
    }
  })

  try {
    let progress = 0

    // load onnx
    const capabilities = {
      simd: await simd(),
      threads: await threads(),
      SharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      numThreads: navigator.hardwareConcurrency ?? 4,
      // @ts-ignore
      webgpu: navigator.gpu !== undefined
    }
    ort.env.wasm.numThreads = capabilities.numThreads
    ort.env.wasm.simd = capabilities.simd
    ort.env.wasm.proxy = true
    const wasms = await loadWASM(onnx, {
      abortController: wasmLoadController,
      onProgress(value) {
        onProgress?.(progress + (1 / 3) * value, progress + (1 / 3) * value, 0)
      }
    })
    ort.env.wasm.wasmPaths = wasms.reduce(
      (rcc: Record<string, string>, ort) => {
        rcc[ort[0]] = URL.createObjectURL(ort[1])
        return rcc
      },
      {}
    )
    progress += 1 / 3

    // load model
    const modelData = await (
      await loadModel(model, {
        abortController: modelLoadController,
        onProgress(value) {
          onProgress?.(
            progress + (1 / 3) * value,
            progress + (2 / 3) * value,
            0
          )
        }
      })
    ).arrayBuffer()
    const session = await ort.InferenceSession.create(modelData, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
      executionMode: 'parallel',
      enableCpuMemArena: true
    }).catch((e: any) => {
      throw new Error(`Failed to create session: ${e}.`)
    })
    wasms.forEach((wasm) => {
      const wasmPaths = ort.env.wasm.wasmPaths
      URL.revokeObjectURL((wasmPaths as any)[wasm[0]])
    })
    progress += 1 / 3

    // process image
    if (onProgress) {
      processInterval = setInterval(() => {
        if (progress >= 0.99 && processInterval != null) {
          clearInterval(processInterval)
          return
        }
        progress += 0.01
        progress = Math.min(progress, 0.99)
        onProgress?.(progress, 1, Math.min((1 - progress) * 3, 0.99))
      }, 1000)
    }

    let imageData = await imageSourceToImageData(image)
    let tensorImage = await imageDataResize(
      imageData,
      model.resolution,
      model.resolution
    )
    const tensorImageData = imageDataToFloat32Array(tensorImage)
    const outputData = await session.run(
      {
        [session.inputNames[0]]: new ort.Tensor(
          'float32',
          new Float32Array(tensorImageData),
          [1, 3, model.resolution, model.resolution]
        )
      },
      {
        terminate: false
      }
    )
    const { outputNames } = session
    session.release().catch(() => {
      // ignore
    })

    const predictionsDict: Array<{
      shape: number[]
      data: Float32Array
      dataType: 'float32'
    }> = []
    for (const key of outputNames) {
      const output: ort.Tensor = outputData[key]
      predictionsDict.push({
        data: output.data as Float32Array,
        shape: output.dims as number[],
        dataType: 'float32'
      })
    }
    const stride = 4 * model.resolution * model.resolution
    for (let i = 0; i < stride; i += 4) {
      const idx = i / 4
      const alpha = predictionsDict[0].data[idx]
      tensorImage.data[i + 3] = alpha * 255
    }
    tensorImage = await imageDataResize(
      tensorImage,
      imageData.width,
      imageData.height
    )
    for (let i = 0; i < imageData.data.length; i += 4) {
      const idx = i + 3
      if (tensorImage.data[idx] === 0) {
        imageData.data[idx - 3] = 0
        imageData.data[idx - 2] = 0
        imageData.data[idx - 1] = 0
      }
      imageData.data[idx] = tensorImage.data[idx]
    }
    const [width, height] = calculateProportionalSize(
      imageData.width,
      imageData.height,
      maxResolution,
      maxResolution
    )
    if (width !== imageData.width || height !== imageData.height) {
      imageData = await imageDataResize(imageData, width, height)
    }

    return imageDataToBlob(imageData)
  } finally {
    if (processInterval != null) {
      clearInterval(processInterval)
    }
  }
}

export default rmbg
