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

  importHistory(twists, moveCount, scramble, scrambleTurns) {
    if (moveCount > twists.length || scrambleTurns !== scramble.length) {
      throw new Error('Invalid History')
    }

    this.twists = twists
    this.moveCount = moveCount

    this.scramble = scramble
    this.scrambleTurns = scrambleTurns
  }

  // this should probably be made async
  // if updating the cubes of all the objects is a problem
  reset() {
    // truncate history
    this.twists.splice(this.moveCount)

    // generate twists for cube to use to reset
    let moves = this.scramble.concat(this.twists)
    moves = moves.map(twist => invertTwist(twist))
    moves = moves.reverse()

    // reset twists and scramble
    this.twists = []
    this.moveCount = 0

    this.scramble = []
    this.scrambleTurns = 0

    return moves
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

