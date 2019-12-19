import { loadAsync } from './util.mjs'
import { compose } from './orientation.mjs'
import { createPiece } from './piece.mjs'
import { createSlice } from './slice.mjs'

class Cube {
  constructor(numDims, dimSize) {
    this.pieces = []
    this.numDims = numDims
    this.dimSize = dimSize
    this.orientation = Array.from(Array(2*numDims)).map((_, i) => i)
  }

  async isSolved() {
    let numPieces = Math.pow(this.dimSize, this.numDims)
    let stickersChosen = Array.from(Array(this.numDims))
    let numUnsolvedPieces = 0

    await loadAsync((i) => {
      let pieceVal = i
      let piece = this.pieces[i]

      for (let j = 0; j < this.numDims; j++) {
        let pieceMod = pieceVal % this.dimSize
        let choice = pieceMod === 0? this.numDims-1-j:
          pieceMod === this.dimSize-1? 2*this.numDims-1-j: -1

        stickersChosen[this.numDims-1-j] = choice
        pieceVal = ~~(pieceVal/this.dimSize)
      }
      if(!piece.matchesStickers(...stickersChosen)) {
        numUnsolvedPieces++
      }
    }, numPieces)

    return numUnsolvedPieces === 0
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

  async twist(twist) {
    let { srcOrientation, dstOrientation, twsOrientation } = twist

    let srcIndices =
      (await this.twistSlice(srcOrientation, twist.layerPicked)).indices
    let dstIndices =
      (await this.twistSlice(dstOrientation, twist.layerPicked)).indices

    let pieces = srcIndices.map(v => this.pieces[v])

    await loadAsync((i) => {
      let piece = pieces[i]
      piece.twist(twsOrientation)
      this.pieces[dstIndices[i]] = piece
    }, pieces.length)
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

