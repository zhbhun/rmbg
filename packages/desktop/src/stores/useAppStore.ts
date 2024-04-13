import { create } from 'zustand'
import { type Platform, platform as getPlatform } from '@tauri-apps/api/os'
import { useModelsStore } from './useModelsStore'
import { useConfigStore } from './useConfigStore'

export interface AppStore {
  platform: Platform
  initiate: () => Promise<void>
}

export const useAppStore = create<AppStore>((set) => ({
  platform: 'linux' as Platform,
  async initiate() {
    try {
      await getPlatform()
        .then((platform) => {
          set({ platform })
        })
        .catch(() => {})
      await useModelsStore
        .getState()
        .initiate()
        .catch(() => {})
      await useConfigStore
        .getState()
        .initiate()
        .catch(() => {})
    } catch (error) {
      // TODO: ...
    }
  }
}))

export default useAppStore
