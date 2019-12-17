import { invert, conjugate } from './orientation.mjs'
import {
  createTwist,
  invertTwist,
  cycleOrientation,
  defaultOrientation
} from './twist.mjs'

/*
  Controller that works independently of representation
*/
class Controller {
  constructor(cube) {
    this.cube = cube
    this.views = []
    this.history = new History()
    this.canMove = true
  }

  async undoMove(numMoves=1) {
    if (!this.canMove) throw Error('Move still in progress')

    this.canMove = false
    for(let i = 0; i < numMoves && this.history.canUndo(); i++) {
      this.cube.twist(this.history.undo())
    }
    // Then update views
    this.canMove = true
  }

  async redoMove(numMoves=1) {
    if(!this.canMove) throw Error('Move still in progress')

    this.canMove = false
    for(let i = 0; i < numMoves && this.history.canRedo(); i++) {
      this.cube.twist(this.history.redo())
    }
    // Then update views
    this.canMove = true
  }
}

/*
  Tracks the move history throughout the 'solve'
*/
class History {
  constructor() {
    this.twists = []
    this.moveCount = 0
  }

  canUndo() {
    return this.moveCount > 0
  }

  canRedo() {
    return this.moveCount < this.twists.length
  }

  undo() {
    let twist = invertTwist(this.twists[this.moveCount])

    if (this.canUndo()) this.moveCount--
    else return null

    return twist
  }

  redo() {
    let twist = this.twists[this.moveCount]

    if (this.canUndo()) this.moveCount++
    else return null

    return twist
  }

  move(twist) {
    // truncate history
    this.twists.splice(this.moveCount)

    // add new move on top
    this.twists.push(twist)
    this.moveCount++
  }
}

export function createController(cube) {
  return new Controller(cube)
}

// controller apply twist
export async function applyTwist(controller, baseFace, sideFace,
    twistFace, layerPicked) {
  let { numDims, dimSize } = controller.cube
  let twistOrientation = cycleOrientation(numDims, baseFace, twistFace)
  let sideOrientation = defaultOrientation(numDims, sideFace)
  let orAction = conjugate(invert(sideOrientation),
    invert(twistOrientation))

  let twist = createTwist(numDims, dimSize, sideFace, layerPicked, orAction)
  controller.history.move(twist)
  await controller.cube.twist(twist)
}