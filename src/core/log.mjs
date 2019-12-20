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

export async function inputLog(controller, file) {
  let contents = (await new Promise(resolve => {
    let reader = new FileReader()
    reader.onload = function(evt) {
      resolve(evt.target.result.split('\n'))
    }
    reader.readAsText(file)
  })).filter(line => line !== '')

  let [header, configLine, ...moves] = contents
  let config = configLine.split(' ').map(n => +n)
  let split = moves.indexOf('---')
  if (split < 0) throw new Error('Invalid File')
  let twistLines = moves.slice(split+1)
  let scrambleLines = moves.slice(0, split)

  let twists = inputTwists(twistLines)
  let scramble = inputTwists(scrambleLines)
  let [numDims, dimSize, scrambleTurns, moveCount] = config
  await controller.importPuzzle(numDims, dimSize, twists, moveCount,
    scramble, scrambleTurns)
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

