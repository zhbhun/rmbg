import { useCallback, useEffect, useState } from 'react'
import { Circle as CircleProgress } from 'rc-progress'
import rmbg from '@rmbg/browser'
import { createBriaaiModel } from '@rmbg/browser/models'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { CirclePicker } from 'react-color'

import CloseOutlinedIcon from '../../icons/outlined/close.svg'
import CompareOutlinedIcon from '../../icons/outlined/compare.svg'
import { createImageWithBackground } from '../../utils/image'

const model = createBriaaiModel(
  process.env.NODE_ENV === 'development'
    ? '/node_modules/@rmbg/model-briaai/'
    : undefined
)

console.log('>>', model, process.env.NODE_ENV)

const images = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1024',
  'https://images.unsplash.com/photo-1623006772851-a8bf2c47d304?q=80&w=1024',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1024',
  'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=1024',
  'https://images.unsplash.com/photo-1620917669809-1af0497965de?q=80&w=1024'
]

export default function Playground(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState('')
  const [background, setBackground] = useState('transparent')
  const [comparing, setComparing] = useState(false)

  const changeSource = (newSource: string) => {
    setSource(newSource)
  }
  const reset = useCallback(() => {
    setSource('')
    setLoading(false)
    setResult('')
    setBackground('transparent')
    setComparing(false)
  }, [])

  useEffect(() => {
    if (source) {
      setLoading(true)
      setProgress(0)
      setDownloading(true)
      rmbg(source, {
        model,
        onnx: {
          publicPath: '/node_modules/onnxruntime-web/dist/'
        },
        runtime: '/node_modules/@rmbg/browser/dist/rmbg-runtime.iife.js',
        onProgress(progress, download) {
          setProgress(progress * 100)
          if (download >= 1) {
            setDownloading(false)
          }
        }
      })
        .then((image) => {
          setResult(URL.createObjectURL(image))
          setLoading(false)
        })
        .catch(() => {
          reset()
        })
    }
  }, [source, reset])
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <div className="container my-20">
        <header className="mb-6 text-center md:mb-12">
          <Heading
            as="h1"
            className="mb-4 font-bold text-4xl md:mb-6 md:text-6xl"
          >
            Background Remover
          </Heading>
          <p className="text-base text-[--ifm-color-secondary-darkest] md:text-lg">
            Remove image backgrounds at no cost and substitute them with a
            variety of backgrounds you prefer.
          </p>
        </header>
        <main>
          {result ? (
            <div className="flex justify-between items-center mx-auto my-4 max-w-screen-sm">
              <CirclePicker
                colors={[
                  'transparent',
                  '#000000',
                  '#e91e63',
                  '#2196f3',
                  '#4caf50'
                ]}
                onChange={(color) => {
                  setBackground(color.hex)
                }}
              />
              <CompareOutlinedIcon
                className="fill-gray-600 cursor-pointer hover:fill-gray-900"
                onPointerDown={() => {
                  setComparing(true)
                }}
                onPointerUp={() => {
                  setComparing(false)
                }}
                onPointerOut={() => {
                  setComparing(false)
                }}
                onPointerCancel={() => {
                  setComparing(false)
                }}
              />
            </div>
          ) : null}

          <div className="relative mx-auto max-w-screen-sm aspect-[4/3] border border-solid border-gray-100 rounded-2xl shadow-lg overflow-hidden">
            {!source ? (
              <div
                className="flex justify-center items-center w-full h-full"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#f5f2fa 0 25%,#0000 0 50%)',
                  backgroundSize: '28px 28px'
                }}
              >
                <button className="button button--primary button--lg relative">
                  Upload an Image
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const sourceURL = URL.createObjectURL(file)
                        changeSource(sourceURL)
                      }
                    }}
                  />
                </button>
              </div>
            ) : null}

            {source && (!result || comparing) ? (
              <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-gray-100">
                <img
                  className="block w-auto h-full object-contain"
                  src={source}
                />
              </div>
            ) : null}

            {result && !comparing ? (
              <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-gray-100">
                <img
                  className="block w-auto h-full object-contain"
                  style={
                    background === 'transparent'
                      ? {
                          backgroundImage:
                            'repeating-conic-gradient(#f5f2fa 0 25%, #0003 0 50%)',
                          backgroundSize: '28px 28px'
                        }
                      : { backgroundColor: background }
                  }
                  src={result}
                />
              </div>
            ) : null}

            {result ? (
              <div
                className="absolute top-2 right-2 flex justify-center items-center w-8 h-8 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
                onClick={reset}
              >
                <CloseOutlinedIcon className="w-4 h-4" />
              </div>
            ) : null}

            {loading ? (
              <div className="absolute flex flex-col justify-center items-center inset-0 w-full h-full bg-[rgba(0,0,0,0.5)]">
                <CircleProgress
                  className="w-8 h-8"
                  percent={progress}
                  strokeWidth={6}
                  strokeColor="#2e8555"
                  trailWidth={6}
                />
                <div className="mt-2 text-white text-xs">
                  {downloading
                    ? 'Downloading the ai model...'
                    : 'Image processing...'}
                </div>
              </div>
            ) : null}
          </div>

          {!result && !loading ? (
            <div className="my-6 text-center">
              <div className="text-sm text-gray-500">
                No picture on hand? Try with one of these
              </div>
              <div className="my-2 flex justify-center items-center">
                {images.map((image, index) => (
                  <img
                    key={index}
                    className="mr-1 w-14 h-14 rounded object-cover cursor-pointer last:mr-0 hover:opacity-85"
                    src={image}
                    alt=""
                    onClick={() => {
                      changeSource(image)
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="my-6 text-center">
              <button
                className="button button--primary button--lg relative"
                onClick={() => {
                  const a = document.createElement('a')
                  if (background === 'transparent') {
                    a.href = result
                    a.download = 'background-removed.png'
                    a.click()
                  } else {
                    createImageWithBackground(result, background)
                      .then((url) => {
                        a.href = url
                        a.download = 'background-removed.png'
                        a.click()
                      })
                      .catch(() => {})
                  }
                }}
              >
                Download
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </Layout>
  )
}
