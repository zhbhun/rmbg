import { invoke } from '@tauri-apps/api/tauri'
import { create } from 'zustand'
import { DEFAULT_MODEL } from '@/config'
import { useModelsStore } from './useModelsStore'

export interface Config {
  model: string
}

export default interface RecordsStore {
  data: Config
  initiate: () => Promise<void>
  update: (data: Partial<Config>) => Promise<void>
}

export const useConfigStore = create<RecordsStore>((set, get) => ({
  data: {
    model: DEFAULT_MODEL
  },
  async initiate() {
    try {
      const data = await invoke<string>('load_config')
      const config = JSON.parse(data)
      if (
        !useModelsStore
          .getState()
          .models.some(
            (model) => model.name === config.model && model.status === 5
          )
      ) {
        config.model = DEFAULT_MODEL
      }
      set({ data: config })
    } catch (error) {
      // ignore
    }
  },
  async update(data) {
    const config = { ...get().data, ...data }
    await invoke<Config>('save_config', {
      config: JSON.stringify(config, null, 2)
    })
    set({ data: config })
  }
}))
