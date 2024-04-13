import * as fs from '@tauri-apps/api/fs'
import {
  appCacheDir as getAppCacheDir,
  resolveResource
} from '@tauri-apps/api/path'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { useToast } from '@/components/ui/use-toast'
import { useEffect } from 'react'
import { create } from 'zustand'
import useAppStore from './useAppStore'
import { useConfigStore } from './useConfigStore'

export interface Model {
  name: string
  title: string
  version: string
  description: string
  resolution: number
  size: number
  url: string
  reference?: string
}

export const models: Model[] = [
  {
    name: 'default',
    title: 'Default',
    version: '0.0.0',
    description: 'A lightweight version of u2net model.',
    resolution: 320,
    size: 4574861,
    url: '',
    reference: 'https://github.com/xuebinqin/U-2-Net'
  },
  {
    name: 'u2net',
    title: 'U2-Net',
    version: '0.0.0',
    description: 'A pre-trained model for general use cases.',
    resolution: 320,
    size: 175997641,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx',
    reference: 'https://github.com/xuebinqin/U-2-Net'
  },
  {
    name: 'u2netp',
    title: 'U2-Netp',
    version: '0.0.0',
    description: 'A lightweight version of u2net model.',
    resolution: 320,
    size: 4574861,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx',
    reference: 'https://github.com/xuebinqin/U-2-Net'
  },
  {
    name: 'u2net_human_seg',
    title: 'U2-Net Human Segmentation',
    version: '0.0.0',
    description: 'A pre-trained model for human segmentation.',
    resolution: 320,
    size: 175997641,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx',
    reference: 'https://github.com/xuebinqin/U-2-Net'
  },
  {
    name: 'u2net_cloth_seg',
    title: 'U2-Net Cloth Segmentation',
    version: '0.0.0',
    description: 'A pre-trained model for Cloths Parsing from human portrait.',
    resolution: 768,
    size: 176194565,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_cloth_seg.onnx',
    reference: 'https://github.com/levindabhi/cloth-segmentation'
  },
  {
    name: 'silueta',
    title: 'Silueta',
    version: '0.0.0',
    description: 'Same as u2net but the size is reduced to 43Mb.',
    resolution: 320,
    size: 44173029,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/silueta.onnx',
    reference: 'https://github.com/xuebinqin/U-2-Net/issues/295'
  },
  {
    name: 'isnet_general_use',
    title: 'Isnet General Use',
    version: '0.0.0',
    description: 'A new pre-trained model for general use cases.',
    resolution: 1024,
    size: 178648008,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx',
    reference: 'https://github.com/xuebinqin/DIS'
  },
  {
    name: 'isnet_anime',
    title: 'Isnet Anime',
    version: '0.0.0',
    description: 'A high-accuracy segmentation for anime character.',
    reference: 'https://github.com/SkyTNT/anime-segmentation',
    resolution: 1024,
    size: 176069933,
    url: 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-anime.onnx'
  },
  {
    name: 'briaai_rmbg',
    title: 'BRIA RMBG',
    version: '1.4.0',
    description:
      'RMBG v1.4 is our state-of-the-art background removal model, designed to effectively separate foreground from background in a range of categories and image types.',
    resolution: 1024,
    size: 176153355,
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/28f8f4114c1385f1478e1102922dce7038164c43/onnx/model.onnx?download=true',
    reference: 'https://huggingface.co/briaai/RMBG-1.4'
  },
  {
    name: 'briaai_rmbg_fp16',
    title: 'BRIA RMBG FP16',
    version: '1.4.0',
    description:
      'RMBG v1.4 is our state-of-the-art background removal model, designed to effectively separate foreground from background in a range of categories and image types.',
    resolution: 1024,
    size: 88217533,
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/28f8f4114c1385f1478e1102922dce7038164c43/onnx/model_fp16.onnx?download=true',
    reference: 'https://huggingface.co/briaai/RMBG-1.4'
  },
  {
    name: 'briaai_rmbg_quantized',
    title: 'BRIA RMBG Quantized',
    version: '1.4.0',
    description:
      'RMBG v1.4 is our state-of-the-art background removal model, designed to effectively separate foreground from background in a range of categories and image types.',
    resolution: 1024,
    size: 44403226,
    url: 'https://huggingface.co/briaai/RMBG-1.4/resolve/28f8f4114c1385f1478e1102922dce7038164c43/onnx/model_quantized.onnx?download=true',
    reference: 'https://huggingface.co/briaai/RMBG-1.4'
  },
  {
    name: 'imgly_small',
    title: 'IMGLY Small',
    version: '0.0.0',
    description: '',
    resolution: 1024,
    size: 44342436,
    url: 'https://github.com/imgly/background-removal-js/raw/688472762e819747362e3e88d5322a8cdbf8a967/bundle/models/small?download=',
    reference: 'https://github.com/imgly/background-removal-js'
  },
  {
    name: 'imgly_medium',
    title: 'IMGLY Medium',
    version: '0.0.0',
    description: '',
    resolution: 1024,
    size: 88188479,
    url: 'https://github.com/imgly/background-removal-js/raw/688472762e819747362e3e88d5322a8cdbf8a967/bundle/models/medium?download=',
    reference: 'https://github.com/imgly/background-removal-js'
  },
  {
    name: 'imgly_large',
    title: 'IMGLY Large',
    version: '0.0.0',
    description: '',
    resolution: 1024,
    size: 176173887,
    url: 'https://github.com/imgly/background-removal-js/raw/688472762e819747362e3e88d5322a8cdbf8a967/bundle/models/large?download=',
    reference: 'https://github.com/imgly/background-removal-js'
  },
  {
    name: 'modnet',
    title: 'MODNet',
    version: '0.0.0',
    description:
      'A Trimap-Free Portrait Matting Solution in Real Time [AAAI 2022]',
    resolution: 512,
    size: 25888640,
    url: 'https://parcel.pyke.io/v2/cdn/assetdelivery/ortrsv2/ex_models/modnet_photographic_portrait_matting.onnx',
    reference: 'https://github.com/ZHKKKe/MODNet'
  }
]

/**
 *
 * - 0: 未下载
 * - 1: 等待中
 * - 2: 下载中
 * - 3：已暂停
 * - 4：下载失败
 * - 5：下载成功
 */
export type ModelStatus = 0 | 1 | 2 | 3 | 4 | 5

export interface ModelRecord extends Model {
  progress: number
  status: ModelStatus
}
export async function getModelFilePath(model: Model) {
  if (!model.url) {
    return resolveResource('./assets/u2netp.onnx')
  }
  const platform = useAppStore.getState().platform
  const appCacheDir = await getAppCacheDir()
  return `${appCacheDir}${platform === 'win32' ? '\\' : '/'}${model.name}-${
    model.version
  }.onnx`
}

export interface ModelsStore {
  models: ModelRecord[]
  update: (name: string, setter: (model: ModelRecord) => ModelRecord) => void
  initiate: () => Promise<void>
  download: (model: Model) => Promise<void>
}

export const useModelsStore = create<ModelsStore>((set, get) => ({
  models: [],
  update(name, setter) {
    set(({ models }) => {
      const index = models.findIndex((item) => item.name === name)
      if (index >= 0) {
        const newModels = models.slice()
        newModels[index] = setter(models[index])
        return { models: newModels }
      }
      return { models }
    })
  },
  initiate: async () => {
    try {
      // const platform = useAppStore.getState().platform
      // const appCacheDir = await getAppCacheDir()
      const records = await Promise.all(
        models.map((model): Promise<ModelRecord> => {
          if (model.url) {
            return getModelFilePath(model).then((path) => {
              return fs
                .exists(path)
                .then((exist) => {
                  const record: ModelRecord = {
                    ...model,
                    status: exist ? 5 : 0,
                    progress: 1
                  }
                  return record
                })
                .catch(() => {
                  const record: ModelRecord = {
                    ...model,
                    status: 0,
                    progress: 0
                  }
                  return record
                })
            })
          }
          return Promise.resolve<ModelRecord>({
            ...model,
            status: 5,
            progress: 1
          })
        })
      )
      set({ models: records })
    } catch (error) {
      set({
        models: models.map((model) => ({
          ...model,
          status: model.url ? 0 : 5,
          progress: 0
        }))
      })
    }
  },
  async download(model: Model) {
    let unlisten: (() => void) | undefined
    try {
      unlisten = await listen<number>(
        `model/download/progress/${model.name}`,
        (event) => {
          get().update(model.name, (prevModel) => ({
            ...prevModel,
            progress: event.payload
          }))
        }
      )
      get().update(model.name, (prevModel) => ({
        ...prevModel,
        progress: 0,
        status: 2
      }))
      await invoke('download_model', {
        name: model.name,
        version: model.version,
        url: model.url
      })
      get().update(model.name, (prevModel) => ({
        ...prevModel,
        progress: 1,
        status: 5
      }))
    } catch (error) {
      get().update(model.name, (prevModel) => ({
        ...prevModel,
        progress: 0,
        status: 4
      }))
      throw error
    } finally {
      unlisten?.()
    }
  }
}))

export function useModelDownload(maxCount = 3) {
  const { toast } = useToast()
  const pending = useModelsStore((state) =>
    state.models.filter((model) => model.status === 1)
  )
  const downloading = useModelsStore((state) =>
    state.models.filter((model) => model.status === 2)
  )
  useEffect(() => {
    if (pending.length > 0 && downloading.length < maxCount) {
      const todos = pending.slice(0, maxCount - downloading.length)
      todos.forEach((model) => {
        useModelsStore
          .getState()
          .download(model)
          .catch(() => {
            toast({
              title: 'Failed to download',
              description: `Failed to download model of ${model.title}`
            })
          })
      })
    }
  }, [maxCount, pending, downloading, toast])
}

export function getCurrentModel() {
  const model = useConfigStore.getState().data.model
  const models = useModelsStore.getState().models
  return models.find((m) => m.name === model) || models[0]
}
