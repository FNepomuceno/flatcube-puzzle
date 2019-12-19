import { completeTwistAction } from './twist.mjs'

export function outputLog(controller) {
  let { cube, history } = controller
  let configLayout = [
    cube.numDims,
    cube.dimSize,
    history.scrambleTurns,
    history.moveCount
  ]

  let header = 'Flat Cube Puzzle'
  let headerConfig = configLayout.join(' ')
  let scrambleConfig = outputTwists(history.scramble)
  let separator = '---'
  let twistHistory = outputTwists(history.twists)

  let lines = [header, headerConfig, '']
  lines = lines.concat(scrambleConfig)
  lines.push(separator)
  lines = lines.concat(twistHistory)

  lines = lines.map(line => line+'\n')

  return lines
}

function inputTwists(twistIdArray) {
  let twistArray = []
  for (const twistId of twistIdArray) {
    let values = twistId.split('-').map(n => +n)
    twistArray.push(completeTwistAction(values))
  }
  return twistArray
}

function outputTwists(twists) {
  let twistStrings = twists.map(t => t.id)

  return twistStrings
}

