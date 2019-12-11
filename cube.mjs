import { load as loadAsync } from './util.mjs'
import { compose } from './orientation.mjs'
import { create as createPiece } from './piece.mjs'

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
}

/*
  Creates a new Cube
*/
export async function create(numDims=3, dimSize=3) {
  let newCube = new Cube(numDims, dimSize)

  await newCube.setPieces()
  return newCube
}

