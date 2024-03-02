export type ImageSource =
  | ImageData
  | ArrayBuffer
  | Uint8Array
  | Blob
  | URL
  | string

export interface RMBGModel {
  name: string
  files: string[]
  mime: string
  publicPath: string
  resolution: number
  size: number
}

export interface RMBGONNXWasm {
  name: string
  files: string[]
  mime: string
  size: number
}

export interface RMBGONNX {
  publicPath?: string
  wasms?: RMBGONNXWasm[]
}

export interface RMBGOptions {
  /** Model  */
  model: RMBGModel
  /** ONNX */
  onnx?: RMBGONNX
  /** ouout image's max resolution */
  maxResolution?: number
  /** Abort controller */
  abortController?: AbortController
  /** progress callback */
  onProgress?: (progress: number, download: number, process: number) => void
}

export const defaultMaxResolution = 2048

export const defaultONNXPublicPath =
  'https://unpkg.com/onnxruntime-web@1.16.2/dist/'

export const defaultONNXWasms = [
  {
    name: 'ort-wasm-simd-threaded.wasm',
    files: ['ort-wasm-simd-threaded.wasm'],
    mime: 'application/wasm',
    size: 10867989
  },
  {
    name: 'ort-wasm-simd.wasm',
    files: ['ort-wasm-simd.wasm'],
    mime: 'application/wasm',
    size: 10912730
  },
  {
    name: 'ort-wasm-threaded.wasm',
    files: ['ort-wasm-threaded.wasm'],
    mime: 'application/wasm',
    size: 9868357
  },
  {
    name: 'ort-wasm.wasm',
    files: ['ort-wasm.wasm'],
    mime: 'application/wasm',
    size: 9931804
  }
]

export const defaultONNX: Required<RMBGONNX> = {
  publicPath: defaultONNXPublicPath,
  wasms: defaultONNXWasms
}
