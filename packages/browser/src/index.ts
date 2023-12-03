import { type RMBGOptions } from './core/config'

async function rmbg(
  image: string,
  options: RMBGOptions,
  runtime: string
): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    const iframe = document.createElement('iframe')
    const htmlContent = `<html><body><script type="module" src="${runtime}"></script></html>`
    iframe.srcdoc = htmlContent
    iframe.width = '0'
    iframe.height = '0'
    document.body.appendChild(iframe)
    function destroy() {
      window.removeEventListener('message', handleMessage)
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      iframe.contentWindow?.location?.reload()
      iframe.remove()
    }
    function handleMessage(event: MessageEvent) {
      if (event.source === iframe.contentWindow) {
        const { name, detail } = event.data
        if (name === 'rmbg:success') {
          resolve(detail)
          destroy()
        } else if (name === 'rmbg:error') {
          destroy()
        }
      }
    }
    function handleLoad() {
      window.addEventListener('message', handleMessage)
      iframe.contentWindow?.postMessage(
        {
          name: 'rmbg:process',
          detail: {
            image,
            options
          }
        },
        '*'
      )
    }
    function handleError() {
      destroy()
    }
    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
  })
}

export default rmbg
