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
    // onProgress
  }: RMBGOptions
): Promise<Blob> {
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
  const wasms = await loadWASM(onnx)
  ort.env.wasm.wasmPaths = wasms.reduce((rcc: Record<string, string>, ort) => {
    rcc[ort[0]] = URL.createObjectURL(ort[1])
    return rcc
  }, {})
  const modelData = await (await loadModel(model)).arrayBuffer()
  const session = await ort.InferenceSession.create(modelData, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
    executionMode: 'parallel',
    enableCpuMemArena: false,
    enableMemPattern: false
  }).catch((e: any) => {
    throw new Error(`Failed to create session: ${e}.`)
  })
  wasms.forEach((wasm) => {
    const wasmPaths = ort.env.wasm.wasmPaths
    URL.revokeObjectURL((wasmPaths as any)[wasm[0]])
  })

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
}

export default rmbg
