import { useEffect, useState } from 'react'
import { GridLoader } from 'react-spinners'
import rmbg from '@rmbg/browser'
import GENERAL_MODEL from '@rmbg/model-general'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'

import BackgroundReplaceIcon from '../../icons/outlined/background_replace.svg'

const model: any = {
  ...GENERAL_MODEL,
  publicPath: '/node_modules/@rmbg/model-general/'
}

export default function Playground(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  useEffect(() => {
    if (source) {
      setLoading(true)
      rmbg(source, {
        model,
        onnx: {
          publicPath: '/node_modules/onnxruntime-web/dist/'
        },
        runtime: '/node_modules/@rmbg/browser/dist/rmbg-runtime.iife.js',
        onProgress(progress) {
          console.log(`>> ${progress}`)
        }
      })
        .then((image) => {
          setResult(URL.createObjectURL(image))
          setLoading(false)
        })
        .catch(() => {
          // TODO: ...
        })
    }
  }, [source])
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
          <div className="relative mx-auto max-w-screen-sm aspect-[4/3] border-white border-2 rounded-2xl shadow-lg overflow-hidden">
            <div
              className="flex justify-center items-center w-full h-full"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(#f5f2fa 0 25%,#0000 0 50%)',
                backgroundSize: '28px 28px'
              }}
            >
              {!result ? (
                <button className="relative flex justify-center items-center h-14 px-4 text-white rounded-lg bg-green-700 hover:opacity-85">
                  Upload an Image
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSource(URL.createObjectURL(file))
                      }
                    }}
                  />
                </button>
              ) : null}
            </div>
            {source && !result ? (
              <img
                className="block absolute inset-0 w-full h-full object-contain"
                src={source}
              />
            ) : null}
            {result ? (
              <img
                className="block absolute inset-0 w-full h-full object-contain"
                src={result}
              />
            ) : null}
            {loading ? (
              <div className="absolute flex justify-center items-center inset-0 w-full h-full bg-[rgba(0,0,0,0.5)]">
                <GridLoader color="#3b82f6" />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </Layout>
  )
}
