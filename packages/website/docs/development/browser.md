---
sidebar_position: 1
---

# Browser

## Install

```shell
$ npm install @rmbg/browser
```

## Usage

```js
import rmbg from '@rmbg/browser'
import { createSiluetaModel } from '@rmbg/browser/models'

rmbg(source, {
  model: createSiluetaModel(),
  onProgress(progress) {
    console.log(progress)
  }
})
  .then((image) => {
    console.log(image)
  })
  .catch((err) => {
    console.error(err)
  })
```
