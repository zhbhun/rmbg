import { invoke } from '@tauri-apps/api/tauri'
import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { getCurrentModel, getModelFilePath } from './useModelsStore'

/**
 * - 0: pending
 * - 1: loading
 * - 2: success
 * - 3: failed
 */
export type ImageRecordStatus = 0 | 1 | 2 | 3

export interface ImageRecord {
  status: ImageRecordStatus
  input: string
  output?: string
}

export default interface RecordsStore {
  images: ImageRecord[]
  add: (files: string[]) => void
  update: (file: string, status: ImageRecordStatus, output?: string) => void
  process: (file: string) => Promise<void>
}

export const useRecordsStore = create<RecordsStore>((set, get) => ({
  images: [],
  add(files: string[]) {
    set(({ images }) => ({
      images: [
        ...files
          .filter(
            (file) =>
              /\.(jpg|jpeg|png)$/.test(file) &&
              !images.some((image) => image.input === file)
          )
          .map((image) => ({
            status: 0 as ImageRecordStatus,
            input: image
          })),
        ...images
      ]
    }))
  },
  update(file: string, status: ImageRecordStatus, output?: string) {
    set(({ images }) => {
      const index = images.findIndex((image) => image.input === file)
      if (index >= 0) {
        const newImages = images.slice()
        newImages[index] = {
          ...images[index],
          status,
          output: output || images[index].output
        }
        return { images: newImages }
      }
      return {}
    })
  },
  async process(file: string) {
    const update = (status: ImageRecordStatus, output?: string) => {
      get().update(file, status, output)
    }
    try {
      update(1)
      const model = getCurrentModel()
      const modelFilePath = await getModelFilePath(model)
      const output = await invoke<string>('rmbg', {
        file,
        model: modelFilePath,
        resolution: model.resolution
      })
      update(2, output)
    } catch (error) {
      update(3)
    }
  }
}))

export function useRecordProcessor() {
  const images = useRecordsStore((state) => state.images)

  const processingImage = useMemo(
    () =>
      images.find((image) => image.status === 0 || image.status === 1)?.input,
    [images]
  )

  useEffect(() => {
    if (processingImage) {
      useRecordsStore
        .getState()
        .process(processingImage)
        .catch(() => {})
    }
  }, [processingImage])
}
