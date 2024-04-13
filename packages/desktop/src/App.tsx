import { useCallback, useEffect } from 'react'
import 'react-photo-view/dist/react-photo-view.css'
import { open } from '@tauri-apps/api/dialog'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import Records from '@/components/Records'
import Settings from '@/components/Settings'
import ModelSelect from '@/components/ModelSelect'
import { useAppStore, useRecordsStore } from '@/stores'
import { Separator } from './components/ui/separator'

function App() {
  const initiate = useAppStore((state) => state.initiate)
  useEffect(() => {
    initiate().catch(() => {})
  }, [initiate])

  const handleAdd = useCallback(async () => {
    try {
      const files = await open({
        multiple: true,
        filters: [
          {
            name: 'Image',
            extensions: ['jpeg', 'jpg', 'png']
          }
        ]
      })
      if (Array.isArray(files)) {
        useRecordsStore.getState().add(files)
      }
    } catch (error) {
      // ignore
    }
  }, [])

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex flex-row items-center justify-between px-3 py-2 border-b border-neutral-200">
        <Button
          onClick={() => {
            handleAdd().catch(() => {})
          }}
        >
          <FilePlusIcon className="mr-2 h-4 w-4" /> Add Picture
        </Button>
        <div className="flex flex-row items-center">
          <ModelSelect />
          <Separator className="ml-5 mr-1 h-5" orientation="vertical" />
          <Settings />
        </div>
      </div>
      <Records />
    </div>
  )
}

export default App
