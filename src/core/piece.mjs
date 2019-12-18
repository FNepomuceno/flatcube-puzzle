import { compose } from './orientation.mjs'

class Piece {
  constructor(numDims) {
    this.numDims = numDims
    this.stickers = Array.from(Array(2*numDims)).map((_, i) => i)
    this.orientation = Array.from(Array(2*numDims)).map((_, i) => i)
  }

  /*
    Sets the stickers for the (newly created) piece

    For each axis of the cube piece, there could be a sticker on at most
    one of the pair of opposite faces. These choices are represented
    with "front", "back", and "none"

    Any input for stickersChosen that isn't "front" or "back" defaults
    to "none"
  */
  setStickers(...stickersChosen) {
    for(let i=0; i < this.numDims; i++) {
      if(stickersChosen[i] !== "front") {
        this.stickers[i] = -1
      }
      if(stickersChosen[i] !== "back") {
        this.stickers[i+this.numDims] = -1
      }
    }
  }

  matchesStickers(...stickersChosen) {
    for (let i=0; i < 2*this.numDims; i++) {
      if(stickersChosen[i%this.numDims] !== i && this.stickers[i] !== -1) {
        return false
      }
      if(stickersChosen[i%this.numDims] === i && this.stickers[i] !== i) {
        return false
      }
    }
    return true
  }

  /*
    Twists the piece

    The twist orientation (twsOrientation) is the orientation to twist
    the piece. This twist can be done starting from some orientation
    and not just the default orientation, called the context
    orientation (ctxOrientation)
  */
  twist(twsOrientation) {
    this.orientation = compose(this.orientation, twsOrientation)
  }

  /*
    Gets the sticker from some orientation of the cube
  */
  getSticker(ctxOrientation) {
    let stkOrientation = compose(this.orientation, ctxOrientation)
    return this.stickers[stkOrientation[0]]
  }
}

/*
  Creates a new Piece
*/
export function createPiece(...stickersChosen) {
  let numDims = stickersChosen.length
  let newPiece = new Piece(numDims)

  newPiece.setStickers(...stickersChosen)
  return newPiece
}

