export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = reject
    image.src = url
  })
}

export function createImageWithBackground(
  image: string,
  color: string
): Promise<string> {
  return loadImage(image).then((img) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not create canvas context')
    }
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'))
          }
          const url = URL.createObjectURL(blob)
          resolve(url)
        },
        'image/png',
        1
      )
    })
  })
}
