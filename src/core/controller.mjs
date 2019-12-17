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

  async applyTwist(baseFace, sideFace, twistFace, layerPicked) {
    let { numDims, dimSize } = this.cube
    let twistOrientation = cycleOrientation(numDims, baseFace, twistFace)
    let sideOrientation = defaultOrientation(numDims, sideFace)
    let orAction = conjugate(invert(sideOrientation),
      invert(twistOrientation))
    let twist = createTwist(numDims, dimSize, sideFace,
      layerPicked, orAction)

    this.canMove = false
    this.history.move(twist)
    await this.cube.twist(twist)
    await this.updateViews()
    this.canMove = true
  }

  async undoMove(numMoves=1) {
    if (!this.canMove) throw Error('Move still in progress')

    this.canMove = false
    for(let i = 0; i < numMoves && this.history.canUndo(); i++) {
      await this.cube.twist(this.history.undo())
    }
    await this.updateViews()
    this.canMove = true
  }

  async redoMove(numMoves=1) {
    if(!this.canMove) throw Error('Move still in progress')

    this.canMove = false
    for(let i = 0; i < numMoves && this.history.canRedo(); i++) {
      await this.cube.twist(this.history.redo())
    }
    await this.updateViews()
    this.canMove = true
  }

  addView(view) {
    this.views.push(view)
  }

  updateViews() {
    return Promise.all(this.views.map(view => { view.update() }))
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

