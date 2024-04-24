import { useRef } from 'react'
import rmbg from '@rmbg/browser'
import {
  createModnetModel,
  createSiluetaModel,
  createBriaaiModel,
  createU2netpModel
} from '../src/models'

const models: any = {
  modnet: createModnetModel('/node_modules/@rmbg/model-modnet/'),
  silueta: createSiluetaModel('/node_modules/@rmbg/model-silueta/'),
  briaai: createBriaaiModel('/node_modules/@rmbg/model-briaai/'),
  u2netp: createU2netpModel('/node_modules/@rmbg/model-u2netp/')
}

function App() {
  const modelRef = useRef<HTMLSelectElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const handleGenerate = () => {
    const model = models[modelRef.current?.value as string]
    const file = fileRef.current?.files?.[0]
    const log = (message: string) => {
      const logEle = logRef.current
      if (logEle) {
        logEle.innerHTML += `<p>${message}</p>`
      }
    }
    if (model && file) {
      log(`>> 0 ${performance.now()}`)
      rmbg(URL.createObjectURL(file), {
        model,
        onnx: {
          publicPath: '/node_modules/onnxruntime-web/dist/'
        },
        // runtime: '/dist/rmbg-runtime.iife.js',
        runtime: '/src/runtime.ts',
        onProgress(progress) {
          console.log(`>> ${progress}`)
        }
      })
        .then((result) => {
          log(`>>1 ${performance.now()} ${URL.createObjectURL(result)}`)
        })
        .catch((error) => {
          log(`>>2 ${performance.now()} - ${error.message}`)
        })
    }
  }
  return (
    <>
      <div>
        <div>
          <select ref={modelRef} name="model" onChange={handleGenerate}>
            <option value="modnet">modnet</option>
            <option value="silueta">silueta</option>
            <option value="briaai">briaai</option>
            <option value="u2netp">u2netp</option>
          </select>
          <input ref={fileRef} type="file" onChange={handleGenerate} />
          <div ref={logRef} />
        </div>
      </div>
    </>
  )
}

export default App
