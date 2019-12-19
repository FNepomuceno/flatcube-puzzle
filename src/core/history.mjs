import { invertTwist } from './twist.mjs'

/*
  Tracks the move history throughout the 'solve'
*/
class History {
  constructor() {
    this.twists = []
    this.moveCount = 0

    this.scramble = []
    this.scrambleTurns = 0
  }

  setScramble(twists) {
    this.scrambleTurns = twists.length
    this.scramble = twists
  }

  canUndo() {
    return this.moveCount > 0
  }

  canRedo() {
    return this.moveCount < this.twists.length
  }

  undo() {
    let twist = invertTwist(this.twists[this.moveCount-1])

    if (this.canUndo()) this.moveCount--
    else return null

    return twist
  }

  redo() {
    let twist = this.twists[this.moveCount]

    if (this.canRedo()) this.moveCount++
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

export function createHistory() {
  return new History()
}

