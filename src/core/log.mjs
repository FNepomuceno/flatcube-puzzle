import { randomTwist } from './twist.mjs'

// Module for loading/saving log files
// And for scrambling/resetting the puzzle

export async function scramble(cube, numMoves=1000) {
  let numDims = cube.numDims
  let dimSize = cube.dimSize
  let facePicked = Math.floor(2*numDims*Math.random())
  for(let i = 0; i < numMoves; i++) {
    let twist = randomTwist(numDims, dimSize, facePicked)
    let newFace = Math.floor((2*numDims-1)*Math.random())

    await cube.twist(twist)

    if (newFace >= facePicked) newFace++
    facePicked = newFace
  }
}

