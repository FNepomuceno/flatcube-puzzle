import { completeTwistAction } from './twist.mjs'

export function inputTwists(twistIdArray) {
  let twistArray = []
  for (const twistId of twistIdArray) {
    let values = twistId.split('-').map(n => +n)
    twistArray.push(completeTwistAction(values))
  }
  return twistArray
}

export function outputTwists(history) {
  let { twists } = history
  let twistStrings = twists.map(t => t.id)

  return twistStrings.join('\n')
}

