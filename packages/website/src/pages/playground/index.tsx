import { useCallback, useEffect, useMemo, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import { Circle as CircleProgress } from 'rc-progress'
import rmbg from '@rmbg/browser'
import {
  type RMBGModel,
  createBriaaiModel,
  createModnetModel,
  createSiluetaModel,
  createU2netpModel
} from '@rmbg/browser/models'
import AddPhotoIcon from '../../icons/outlined/add_photo.svg'
import DownloadIcon from '../../icons/outlined/download.svg'

const isDev = process.env.NODE_ENV === 'development'

interface ModelOption {
  label: string
  value: RMBGModel
}

const models: ModelOption[] = [
  {
    label: 'U2netp',
    value: createU2netpModel(
      isDev
        ? '/node_modules/@rmbg/model-u2netp/'
        : undefined
    )
  },
  {
    label: 'Modnet',
    value: createModnetModel(
      isDev
        ? '/node_modules/@rmbg/model-modnet/'
        : undefined
    )
  },
  {
    label: 'Briaai',
    value: createBriaaiModel(
      isDev
        ? '/node_modules/@rmbg/model-briaai/'
        : undefined
    )
  },
  {
    label: 'Silueta',
    value: createSiluetaModel(
      isDev
        ? '/node_modules/@rmbg/model-silueta/'
        : undefined
    )
  }
]

let taskid = 0

interface TaskItem {
  id: string
  file: File
  model: RMBGModel
  status: 'pending' | 'processing' | 'done' | 'error'
  result?: string
}

interface TaskProcessProps {
  task: TaskItem
  onFinish?: (task: TaskItem) => void
}

function TaskProcess({ task, onFinish }: TaskProcessProps) {
  const source = useMemo(() => URL.createObjectURL(task.file), [task.file])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState('')
  const [background, setBackground] = useState('transparent')

  const reset = useCallback(() => {
    setLoading(false)
    setProgress(0)
    setDownloading(false)
    setResult('')
    setBackground('transparent')
  }, [])

  const process = useCallback(
    (source: string, model: RMBGModel) => {
      setLoading(true)
      setProgress(0)
      setDownloading(true)
      rmbg(source, {
        model,
        onnx: {
          publicPath: isDev ? '/node_modules/onnxruntime-web/dist/' : undefined
        },
        runtime:
          isDev
            ? '/node_modules/@rmbg/browser/dist/rmbg-runtime.iife.js'
            : undefined,
        onProgress(progress, download) {
          setProgress(progress * 100)
          if (download >= 1) {
            setDownloading(false)
          }
        }
      })
        .then((image) => {
          setLoading(false)
          setProgress(0)
          setDownloading(false)
          setResult(URL.createObjectURL(image))
          onFinish?.({
            ...task,
            status: 'done'
          })
        })
        .catch(() => {
          reset()
          onFinish?.({
            ...task,
            status: 'error'
          })
        })
    },
    [task, reset, onFinish]
  )

  useEffect(() => {
    if (task.status === 'processing' && source) {
      process(source, task.model)
    }
  }, [task, source, process])
  return (
    <div className="my-3 bg-white rounded-lg shadow-lg overflow-hidden md:shadow-none">
      <div className="flex justify-between items-center py-2 px-3 md:">
        <div className="flex flex-row justify-start items-center">
          <img
            className="hidden mr-4 w-[50px] h-[50px] object-cover md:block"
            src={result || source}
            style={{
              backgroundImage:
                'repeating-conic-gradient(#f5f2fa 0 25%, #0003 0 50%)',
              backgroundSize: '28px 28px'
            }}
          />
          <div className="text-sm font-semibold">{task.file.name}</div>
        </div>
        {result ? (
          <DownloadIcon
            className="w-5 h-5 cursor-pointer"
            fill="#2e8555"
            onClick={() => {
              const a = document.createElement('a')
              a.href = result
              a.download = `${task.file.name}-rmbg.png`
              a.click()
            }}
          />
        ) : (
          <div className="hidden text-neutral-500 md:block">
            {task.status === 'processing'
              ? `${progress.toFixed(2)}%`
              : 'Pending...'}
          </div>
        )}
      </div>
      <div className="relative aspect-[2/1] overflow-hidden md:hidden">
        <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-neutral-50">
          <img className="block w-auto h-full object-contain" src={source} />
        </div>
        {result ? (
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
        ) : task.status === 'pending' ? (
          <div className="absolute flex flex-col justify-center items-center inset-0 w-full h-full bg-[rgba(0,0,0,0.5)]">
            <div className="mt-2 text-white text-xs">Pending...</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function App(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const [model, setModel] = useState<ModelOption>(models[0])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const handleFinish = useCallback((task) => {
    setTasks((tasks) => {
      return tasks.map((t) => (t.id === task.id ? task : t))
    })
  }, [])
  useEffect(() => {
    const pendingIndex = tasks.findIndex((task) => task.status === 'pending')
    if (
      pendingIndex >= 0 &&
      !tasks.some((task) => task.status === 'processing')
    ) {
      setTasks((tasks) => {
        const newTasks = tasks.slice()
        newTasks[pendingIndex] = {
          ...newTasks[pendingIndex],
          status: 'processing'
        }
        return newTasks
      })
    }
  }, [tasks])
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <main className="grow">
        <section className="relative h-[700px] md:h-[500px] lg:h-[600px]">
          <div className="container flex flex-col md:flex-row md:justify-between md:items-center md:h-full">
            <div className="relative flex flex-col justify-bewteen h-[300px] pt-6 md:w-[300px] lg:w-[400px]">
              <img
                className="absolute bottom-[-30px] right-[-50px] w-full max-w-[400px] opacity-50 sm:max-w-[500px] md:w-ful md:left-[-50px] md:right-auto lg:left-0"
                src="/img/hero.png"
              />
              <Heading as="h1" className="text-neutral-700">
                BACKGROUND REMOVER
              </Heading>
              <p className="mb-4 text-sm text-[#666] text-neutral-500">
                Automatically and zero cost.
              </p>
            </div>
            <div className="relative flex flex-col justify-center items-center mt-[50px] mb-[25px] h-[300px] bg-[rgba(255,255,255,0.25)] rounded-lg shadow-lg backdrop-blur md:flex-1 md:mx-[20px] lg:mx-[50px]">
              <AddPhotoIcon className="w-16 h-16" fill="#404040" />
              <div className="mt-4 text-lg text-neutral-700 font-semibold">
                Select you files here
              </div>
              <div className="text-sm text-neutral-600">
                Up to 20 images, max 5 MB each.
              </div>
              <div className="flex justify-center items-center text-xs text-neutral-500">
                <label>Model: </label>
                <select
                  className="relative z-10 width-full h-[32px] text-xs text-neutral-500 border-none bg-transparent"
                  value={model.value.name}
                  onChange={(e) => {
                    setModel(
                      models.find((m) => m.value.name === e.target.value)!
                    )
                  }}
                >
                  {models.map((model) => (
                    <option key={model.value.name} value={model.value.name}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 20)
                  setTasks((prev) => [
                    ...prev,
                    ...files.map((file) => ({
                      id: `${taskid++}`,
                      file,
                      model: model.value,
                      status: 'pending'
                    }))
                  ])
                }}
              />
            </div>
          </div>
        </section>
        {tasks.length > 0 ? (
          <section className="relative container md:mt-[-50px] md:mb-4">
            <div className="py-2 bg-white md:rounded-xl md:shadow-xl">
              {tasks.map((task) => (
                <TaskProcess
                  key={task.id}
                  task={task}
                  onFinish={handleFinish}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </Layout>
  )
}
