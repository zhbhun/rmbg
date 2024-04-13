import classNames from 'classnames'
import { type ReactElement, useCallback, useEffect, useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { type Event as TauriEvent, listen } from '@tauri-apps/api/event'
import * as path from '@tauri-apps/api/path'
import * as shell from '@tauri-apps/api/shell'
import {
  CircleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  OpenInNewWindowIcon,
  ReloadIcon
} from '@radix-ui/react-icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import AddPhotoAlternateIcon from '@/components/icons/AddPhotoAlternateIcon'
import { useAppStore, useRecordProcessor, useRecordsStore } from '@/stores'
import Previewer from './Previewer'

const STATUS_ICONS: Record<number, ReactElement> = {
  0: <CircleIcon className="inline-block text-orange-500" />,
  1: <ReloadIcon className="inline-block animate-spin" />,
  2: <CheckCircledIcon className="inline-block text-green-500" />,
  3: <CrossCircledIcon className="inline-block text-red-500" />
}

export interface RecordsProps {
  className?: string
}

export function Records({ className }: RecordsProps) {
  const platform = useAppStore((state) => state.platform)
  const images = useRecordsStore((state) => state.images)

  const [previewIndex, setPreviewIndex] = useState(-1)
  const [previewMode, setPreviewMode] = useState(true)
  useEffect(() => {
    if (previewIndex < 0) {
      let dispose: (() => void) | undefined
      listen('tauri://file-drop', (event: TauriEvent<string[]>) => {
        useRecordsStore.getState().add(event.payload)
      })
        .then((unlisten) => {
          dispose = unlisten
        })
        .catch(() => {})
      return () => {
        dispose?.()
      }
    }
    return () => {}
  }, [previewIndex])

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

  useRecordProcessor()

  return (
    <>
      <div
        className={classNames('grow bg-neutral-50 overflow-hidden', className)}
      >
        {images.length > 0 ? (
          <Table
            className="w-full table-fixed"
            wrapperClassName="h-full overflow-y-auto"
          >
            <TableHeader className="sticky z-10 top-0 left-0 right-0 bg-neutral-100">
              <TableRow>
                <TableHead className="w-[60px] text-center">Status</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Output</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image, index) => {
                const splash = platform === 'win32' ? '\\' : '/'
                const inputs = image.input.split(splash)
                const inputDirectory = inputs
                  .slice(0, inputs.length - 1)
                  .join(splash)
                const inputFileName = inputs[inputs.length - 1]
                const outputs = (image.output ?? '').split(splash)
                const outputDirectory = outputs
                  .slice(0, outputs.length - 1)
                  .join(splash)
                const outputFileName = outputs[outputs.length - 1]
                return (
                  <TableRow
                    key={image.input}
                    className="cursor-pointer even:bg-muted"
                  >
                    <TableCell className="text-center">
                      {STATUS_ICONS[image.status]}
                    </TableCell>
                    <TableCell
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setPreviewIndex(index)
                        setPreviewMode(false)
                      }}
                    >
                      <div
                        className="group relative flex items-center w-full pr-5 whitespace-nowrap overflow-hidden"
                        title={image.input}
                      >
                        <div className="shrink text-ellipsis overflow-hidden">
                          {inputDirectory}
                        </div>
                        <div className="shrink-0 max-w-full text-ellipsis overflow-hidden">
                          {inputFileName}
                        </div>
                        <OpenInNewWindowIcon
                          className="absolute right-0 w-4 h-4 text-neutral-500 hidden group-hover:block"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            path
                              .resolve(image.input, '..')
                              .then((directory) => {
                                shell.open(directory).catch(() => {})
                              })
                              .catch(() => {})
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setPreviewIndex(index)
                        setPreviewMode(true)
                      }}
                    >
                      <div
                        className="group relative flex items-center w-full pr-5 whitespace-nowrap overflow-hidden"
                        title={image.output ?? ''}
                      >
                        <div className="shrink text-ellipsis overflow-hidden">
                          {outputDirectory}
                        </div>
                        <div className="shrink-0 max-w-full text-ellipsis overflow-hidden">
                          {outputFileName}
                        </div>
                        {image.output ? (
                          <OpenInNewWindowIcon
                            className="absolute right-0 w-4 h-4 text-neutral-500 hidden group-hover:block"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              if (image.output) {
                                path
                                  .resolve(image.output, '..')
                                  .then((directory) => {
                                    shell.open(directory).catch(() => {})
                                  })
                                  .catch(() => {})
                              }
                            }}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            onClick={() => {
              handleAdd().catch(() => {})
            }}
          >
            <AddPhotoAlternateIcon className="mb-2 text-8xl" fill="#666" />
            <div className="mb-1 text-xl text-muted-foreground">
              Drop your images here!
            </div>
            <div className="text-sm text-muted-foreground">JPG / PNG</div>
          </div>
        )}
      </div>
      <Previewer
        open={previewIndex >= 0}
        initiateIndex={previewIndex}
        initialMode={previewMode}
        images={images}
        onClose={() => {
          setPreviewIndex(-1)
        }}
      />
    </>
  )
}

export default Records
