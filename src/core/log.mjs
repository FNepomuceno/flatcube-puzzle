import { randomTwist, completeTwistAction } from './twist.mjs'

// Module for loading/saving log files
// And for scrambling/resetting the puzzle

export async function scramble(cube, numMoves=1000) {
  let numDims = cube.numDims
  let dimSize = cube.dimSize

  let facePicked = 2*numDims
  let twists = Array.from(Array(numMoves)).map(() => {
    facePicked = nextFace(facePicked)
    return randomTwist(numDims, dimSize, facePicked)
  })

  for (let i = 0; i < numMoves; i++) {
    await cube.twist(twists[i])
  }

  function nextFace(curFace=2*numDims) {
    let newFace = Math.floor((2*numDims-1)*Math.random())
    if (newFace >= curFace) newFace++
    return newFace
  }
}

export function inputTwists(twistIdArray) {
  let twistArray = []
  for (const twistId of twistIdArray) {
    let values = twistId.split('-').map(n => +n)
    twistArray.push(completeTwistAction(values))
  }
  return twistArray
}

export function outputTwists(history) {
  let { twists } = history
  let twistStrings = twists.map(t => t.id)

  return twistStrings.join('\n')
}

