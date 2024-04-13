import { useEffect, useState } from 'react'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import 'react-photo-view/dist/react-photo-view.css'
import { PhotoSlider } from 'react-photo-view'
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import classes from './Previewer.module.scss'

export interface PreviewerProps {
  open: boolean
  initiateIndex: number
  images: Array<{
    input: string
    output?: string
  }>
  onClose: () => void
}

export function Previewer({
  open,
  initiateIndex,
  images,
  onClose
}: PreviewerProps) {
  const [previewIndex, setPreviewIndex] = useState(initiateIndex)
  useEffect(() => {
    if (open) {
      setPreviewIndex(initiateIndex)
    }
  }, [open, initiateIndex])

  const [previewMode, setPreviewMode] = useState(true)

  return (
    <PhotoSlider
      visible={open}
      index={Math.max(previewIndex, 0)}
      images={images.map((item) => ({
        key: item.input,
        src:
          item.output && previewMode
            ? convertFileSrc(item.output)
            : convertFileSrc(item.input)
      }))}
      maskOpacity={0.6}
      photoClassName={classes.previewer__photo}
      overlayRender={() => {
        return previewMode ? (
          <EyeOpenIcon
            className="absolute z-20 top-3 left-1/2 translate-x-[-50%] h-5 w-5 text-neutral-300 cursor-pointer "
            onClick={() => {
              setPreviewMode(false)
            }}
          />
        ) : (
          <EyeClosedIcon
            className="absolute z-20 top-3 left-1/2 translate-x-[-50%] h-5 w-5 text-neutral-300 cursor-pointer "
            onClick={() => {
              setPreviewMode(true)
            }}
          />
        )
      }}
      onIndexChange={setPreviewIndex}
      onClose={onClose}
    />
  )
}

export default Previewer
