import rmbg from './core'

window.addEventListener('message', (event) => {
  if (event.source === window.parent) {
    const { name, detail } = event.data
    if (name === 'rmbg:process') {
      const { image, options } = detail
      rmbg(image, options)
        .then((data) => {
          window.parent.postMessage(
            {
              name: 'rmbg:success',
              detail: data
            },
            '*'
          )
        })
        .catch((error) => {
          window.parent.postMessage(
            {
              name: 'rmbg:error',
              message: error.message,
              stack: error.stack
            },
            '*'
          )
        })
    }
  }
})
