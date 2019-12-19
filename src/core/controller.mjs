import { invert, conjugate } from './orientation.mjs'
import {
  createTwist,
  cycleOrientation,
  defaultOrientation,
  randomTwist
} from './twist.mjs'
import { createHistory } from './history.mjs'

/*
  Controller that works independently of representation
*/
class Controller {
  constructor(cube) {
    this.cube = cube
    this.views = []
    this.history = createHistory()
    this.scrambleTurns = 0
    this.scramble = []
    this.canMove = true
  }

  async reset() {
    let twists = this.history.reset()
    for (const twist of twists) {
      await this.cube.twist(twist)
    }
    await this.updateViews()
  }

  async generateScramble(scrambleTurns=0) {
    this.scrambleTurns = scrambleTurns
    this.scramble = []

    let { numDims, dimSize } = this.cube
    let facePicked = 2*numDims
    let twists = Array.from(Array(scrambleTurns)).map(() => {
      facePicked = nextFace(facePicked)
      return randomTwist(numDims, dimSize, facePicked)
    })

    for (let i = 0; i < scrambleTurns; i++) {
      await this.cube.twist(twists[i])
    }

    await this.updateViews()
    this.history.setScramble(twists)

    function nextFace(curFace=2*numDims) {
      let newFace = Math.floor((2*numDims-1)*Math.random())
      if (newFace >= curFace) newFace++
      return newFace
    }
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

  async undoMove(numMoves=-1) {
    if (!this.canMove) throw Error('Move still in progress')
    if (!this.history.canUndo()) throw Error('Cannot undo')

    this.canMove = false
    for(let i = 0; i < numMoves || numMoves < 0; i++) {
      if(!this.history.canUndo()) break
      await this.cube.twist(this.history.undo())
    }
    await this.updateViews()
    this.canMove = true
  }

  async redoMove(numMoves=-1) {
    if(!this.canMove) throw Error('Move still in progress')
    if (!this.history.canRedo()) throw Error('Cannot redo')

    this.canMove = false
    for(let i = 0; i < numMoves || numMoves < 0; i++) {
      if(!this.history.canRedo()) break
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

export function createController(cube) {
  return new Controller(cube)
}

