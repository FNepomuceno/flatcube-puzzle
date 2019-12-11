import { loadAsync } from './util.mjs'
import { compose } from './orientation.mjs'
import { calculateTwist } from './twist.mjs'
import { createPiece } from './piece.mjs'

class Cube {
  constructor(numDims, dimSize) {
    this.pieces = []
    this.numDims = numDims
    this.dimSize = dimSize
    this.dimensions = Array(numDims).fill(dimSize) // old var
    this.orientation = Array.from(Array(2*numDims)).map((_, i) => i)
  }

  /*
    Sets the pieces for the (newly created) cube

    The number of pieces created could be very large depending on
    the dimensions of the cube given. For example an 8^7 puzzle needs
    about 2.1 million pieces which takes several seconds to set up

    To keep the browser responsive during this process, this method
    is made asynchronous
  */
  async setPieces() {
    let numPieces = Math.pow(this.dimSize, this.numDims)
    let stickersChosen = Array.from(Array(this.numDims))

    await loadAsync((i) => {
      let pieceVal = i

      for (let j = 0; j < this.numDims; j++) {
        let pieceMod = pieceVal % this.dimSize
        let choice = pieceMod === 0? 'front':
          pieceMod === this.dimSize-1? 'back': 'none'

        stickersChosen[this.numDims-1-j] = choice
        pieceVal = ~~(pieceVal/this.dimSize)
      }
      this.pieces.push(createPiece(...stickersChosen))
    }, numPieces)
  }

  rotate(orientation) {
    this.orientation = compose(this.orientation, orientation)
  }

  twistSlice(orientation, layerChoice) {
    return createSlice(this, orientation, this.numDims-1, [layerChoice])
  }

  async twist(sideOrientation, twistOrientation, layerChoice) {
    let twist = calculateTwist(this.numDims, this.dimSize,
      this.orientation, sideOrientation, twistOrientation, layerChoice)
    let { srcOrientation, dstOrientation } = twist

    let srcIndices = (await this.twistSlice(srcOrientation, layerChoice))
      .indices
    let dstIndices = (await this.twistSlice(dstOrientation, layerChoice))
      .indices

    let pieces = srcIndices.map(v => this.pieces[v])

    await loadAsync((i) => {
      let piece = pieces[i]
      piece.twist(twistOrientation, this.orientation)
      this.pieces[dstIndices[i]] = piece
    }, pieces.length)
  }
}

class Slice {
  constructor(cube, orientation, numDims, layerChoices) {
    this.cube = cube
    this.orientation = orientation
    this.numDims = numDims
    this.dimSize = cube.dimSize
    this.layerChoices = layerChoices
    this.indices = []
  }

  /*
    Helper function for setIndices to get sides and offsets
  */
  indexParams() {
    // get axes and sides from orientation
    let faces = Array.from(this.orientation)
      .slice(0, this.cube.numDims)
      .reverse()
    let sides = faces.map(f => ~~(f / this.cube.numDims))
    let axes = faces.map(f => {
      return this.cube.numDims - 1 - (f % this.cube.numDims)
    })

    // get offsets from axes
    let baseOffsets = Array.from(Array(this.cube.numDims))
      .map((_, i) => Math.pow(this.dimSize, i))
    let offsets = Array.from(Array(this.cube.numDims))
      .map((_, i) => baseOffsets[axes[i]])

    return { sides, offsets }
  }

  /*
    Sets the indices of the Slice

    For now, the dimIndices are set to 0. In the future, the portion
    of the dimIndices that won't be affected by the (j) for loop will
    access different layers of the cube
  */
  async setIndices() {
    let { sides, offsets } = this.indexParams()
    let dimIndices = Array(this.cube.numDims).fill(0)
    let numIndices = Math.pow(this.dimSize, this.numDims)

    this.layerChoices.forEach((v, i) => {
      dimIndices[i+this.numDims] = v
    })

    await loadAsync((i) => {
      let indexVal = i
      let newIndex = 0

      for (let j = 0; j < this.numDims; j++) {
        let indexMod = indexVal % this.dimSize
        dimIndices[j] = indexMod
        indexVal = ~~(indexVal/this.dimSize)
      }
      for (let k = 0; k < this.cube.numDims; k++) {
        let amtOffset = sides[k] === 0?
          dimIndices[k]:  this.dimSize-1-dimIndices[k]
        newIndex += amtOffset * offsets[k]
      }
      this.indices.push(newIndex)
    }, numIndices)

    this.pieces = this.indices.map(i => this.cube.pieces[i])
  }
}

/*
  Creates a new Cube
*/
export async function createCube(numDims=3, dimSize=3) {
  let newCube = new Cube(numDims, dimSize)

  await newCube.setPieces()
  return newCube
}

/*
  Creates a new Slice
*/
export async function createSlice(cube, orientation,
    numDims, layerChoices) {
  let newSlice = new Slice(cube, orientation, numDims, layerChoices)

  await newSlice.setIndices()
  return newSlice
}

