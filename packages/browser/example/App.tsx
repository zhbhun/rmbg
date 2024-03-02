import { useRef } from 'react'
import rmbg from '@rmbg/browser'
import {
  createGeneralModel,
  createSiluetaModel,
  createBriaaiModel
} from '../src/models'

const models: any = {
  general: createGeneralModel('/node_modules/@rmbg/model-general/'),
  silueta: createSiluetaModel('/node_modules/@rmbg/model-silueta/'),
  briaai: createBriaaiModel('/node_modules/@rmbg/model-briaai/')
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
            <option value="general">general</option>
            <option value="silueta">silueta</option>
            <option value="briaai">briaai</option>
          </select>
          <input ref={fileRef} type="file" onChange={handleGenerate} />
          <div ref={logRef} />
        </div>
      </div>
    </>
  )
}

export default App
