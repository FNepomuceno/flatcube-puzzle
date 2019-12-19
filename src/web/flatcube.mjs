import { createCube } from '../core/cube.mjs'
import { createView } from './view.mjs'
import { createModder } from './modder.mjs'

export function getParams() {
  let urlParams = new URLSearchParams(window.location.search)
  let numDims
  let dimSize
  let scrambleTurns

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

  if(urlParams.has('scramble-turns')) {
    let param = +urlParams.get('scramble-turns')
    scrambleTurns = param
  } else {
    scrambleTurns = 0
  }

  if(Math.pow(dimSize, numDims) > 100000) {
    console.error('Puzzle too large. Resetting to 3^3')
    numDims = 3
    dimSize = 3
  }

  return [numDims, dimSize, scrambleTurns]
}

export async function run(numDims, dimSize, scrambleTurns) {
  let puz = await createCube(numDims, dimSize)
  let vew = await createView(puz, 'game-view')
  let gam = createModder(puz, 'game-options', 'cube')
  gam.addView(vew, 'main')
  await gam.scramble(scrambleTurns)
}

