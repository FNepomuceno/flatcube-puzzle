import { create as createCube } from './cube.mjs'
import { create as createView } from './view.mjs'
import { create as createModder } from './modder.mjs'

export function getParams() {
  let urlParams = new URLSearchParams(window.location.search)
  let numDims
  let dimSize

  if(urlParams.has('num-dims')) {
    let param = +urlParams.get('num-dims')
    if(!isNaN(param) && param >= 3) {
      numDims = param
    } else {
      console.error('Invalid dimension amount. Resetting to 3')
    }
  } else {
    numDims = 3
  }

  if(urlParams.has('dim-size')) {
    let param = +urlParams.get('dim-size')
    if(!isNaN(param) && param >= 2) {
      dimSize = param
    } else {
      console.error('Invalid dimension size. Resetting to 3')
    }
  } else {
    dimSize = 3
  }

  if(Math.pow(dimSize, numDims) > 100000) {
    console.error('Puzzle too large. Resetting to 3^3')
    numDims = 3
    dimSize = 3
  }

  return [numDims, dimSize]
}

export async function run(numDims, dimSize) {
  let puz = await createCube(numDims, dimSize)
  let vew = await createView(puz, 'game-view')
  let gam = createModder(puz, 'game-options', 'cube')
  gam.addView(vew, 'main')
}

// Run the Flatcube program
run(...getParams());

