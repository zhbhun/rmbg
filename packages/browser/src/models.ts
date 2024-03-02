import { type RMBGModel } from './core/config'

export function createBriaaiModel(
  publicPath = 'https://unpkg.com/@rmbg/model-briaai@0.0.1/'
): RMBGModel {
  return {
    name: 'briaai',
    files: [
      'briaai-1.onnx',
      'briaai-2.onnx',
      'briaai-3.onnx',
      'briaai-4.onnx',
      'briaai-5.onnx'
    ],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 1024,
    size: 44403226
  }
}

export function createGeneralModel(
  publicPath = 'https://unpkg.com/@rmbg/model-general@0.0.1/'
): RMBGModel {
  return {
    name: 'general',
    files: [
      'general-1.onnx',
      'general-2.onnx',
      'general-3.onnx',
      'general-4.onnx',
      'general-5.onnx',
      'general-6.onnx',
      'general-7.onnx',
      'general-8.onnx',
      'general-9.onnx'
    ],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 1024,
    size: 88188479
  }
}

export function createIsnetAnimeModel(
  publicPath = 'https://unpkg.com/@rmbg/model-isnet-anime@0.0.1/'
): RMBGModel {
  return {
    name: 'isnet-anime',
    files: [
      'isnet-anime-1.onnx',
      'isnet-anime-2.onnx',
      'isnet-anime-3.onnx',
      'isnet-anime-4.onnx',
      'isnet-anime-5.onnx',
      'isnet-anime-6.onnx',
      'isnet-anime-7.onnx',
      'isnet-anime-8.onnx',
      'isnet-anime-9.onnx',
      'isnet-anime-10.onnx',
      'isnet-anime-12.onnx',
      'isnet-anime-13.onnx',
      'isnet-anime-14.onnx',
      'isnet-anime-15.onnx',
      'isnet-anime-16.onnx',
      'isnet-anime-17.onnx',
      'isnet-anime-18.onnx',
      'isnet-anime-19.onnx'
    ],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 320,
    size: 176069933
  }
}

export function createSiluetaModel(
  publicPath = 'https://unpkg.com/@rmbg/model-silueta@0.0.1/'
): RMBGModel {
  return {
    name: 'silueta',
    files: [
      'silueta-1.onnx',
      'silueta-2.onnx',
      'silueta-3.onnx',
      'silueta-4.onnx',
      'silueta-5.onnx'
    ],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 320,
    size: 44173029
  }
}

export function createU2netClothModel(
  publicPath: 'https://unpkg.com/@rmbg/model-u2net-cloth@0.0.1/'
): RMBGModel {
  return {
    name: 'u2net-cloth',
    files: [
      'u2net-cloth-1.onnx',
      'u2net-cloth-2.onnx',
      'u2net-cloth-3.onnx',
      'u2net-cloth-4.onnx',
      'u2net-cloth-5.onnx',
      'u2net-cloth-6.onnx',
      'u2net-cloth-7.onnx',
      'u2net-cloth-8.onnx',
      'u2net-cloth-9.onnx',
      'u2net-cloth-10.onnx',
      'u2net-cloth-12.onnx',
      'u2net-cloth-13.onnx',
      'u2net-cloth-14.onnx',
      'u2net-cloth-15.onnx',
      'u2net-cloth-16.onnx',
      'u2net-cloth-17.onnx',
      'u2net-cloth-18.onnx',
      'u2net-cloth-19.onnx'
    ],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 320,
    size: 176194565
  }
}

export function createU2netpModel(
  publicPath = 'https://unpkg.com/@rmbg/model-u2netp@0.0.1/'
): RMBGModel {
  return {
    name: 'u2netp',
    files: ['u2netp.onnx'],
    mime: 'application/octet-stream',
    publicPath,
    resolution: 320,
    size: 4574861
  }
}
