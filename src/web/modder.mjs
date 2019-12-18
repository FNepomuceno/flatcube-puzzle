import { axisRotation } from '../core/util.mjs'
import { createController } from '../core/controller.mjs'
import { createOption } from './option.mjs'

class Modder {
  constructor(cube, canvasId, tag) {
    this.controller = createController(cube)
    this.canvas = document.getElementById(canvasId)
    this.views = new Map()
    this.options = new Map()
  }

  addOption(option, type) {
    this.options.set(type, option)
    this.canvas.appendChild(option.node)
  }

  addView(view, key) {
    this.views.set(key, view)
    this.controller.addView(view.view)
  }

  async update() {
    for (const [_, option] of this.options) {
      option.update(option.node, this.controller)
    }

    for (const [_, view] of this.views) {
      await view.setCells()
    }
  }

  setUpdate(type, fn=()=>0) {
    let option = this.options.get(type)
    option.setUpdate(fn)
  }

  setHandler(type, cb=()=>0, ...args) {
    let option = this.options.get(type)
    let button = option.node.getElementsByTagName('button')[0]
    button.addEventListener('click', async () => {
      await cb(this.controller, option.poll())
      await this.update()
    })
  }
}

// helper method (for now; this should go in controller)
function calcRotateOrientation(numDims, displayedChoice,
    undisplayedChoice, orientDirection) {
  let displayedDim = numDims-1-displayedChoice
  let undisplayedDim = numDims-3-undisplayedChoice

  let dimRotation = orientDirection == 0?
    [displayedDim, undisplayedDim]: [undisplayedDim, displayedDim]
  let orientation = axisRotation(numDims, ...dimRotation)

  return orientation
}

/*
  Rotates the cube according to the options set on the modder
*/
async function rotateCube(controller, values) {
  // Put this in controller
  let cube = controller.cube
  cube.rotate(calcRotateOrientation(cube.numDims, ...values))
  await controller.updateViews()
}

/*
  Twists the cube according to the options set on the modder
*/
async function makeTwist(controller, values) {
  let { numDims, orientation } = controller.cube
  let [sidePicked, twistDirection, layerPicked] = values
  let baseFace = orientation[0]

  let sideChoices = [numDims-2, numDims-1, 2*numDims-2, 2*numDims-1]
  let sideFace = orientation[sideChoices[sidePicked]]

  let sideOffset = Math.pow(-1, twistDirection)
  let twistFace = orientation[sideChoices[(4+sidePicked+sideOffset)%4]]

  await controller.applyTwist(baseFace, sideFace, twistFace, layerPicked)
  if(await controller.cube.isSolved()) console.info('You solved the cube!')
}

async function changeLayers(controller, values) {
  let newLayers = values
  newLayers.push(0)
  controller.views.forEach(view => {
    view.layers = newLayers
  })
  await controller.updateViews()
}

export function createModder(cube, canvasId, tag) {
  let modder = new Modder(cube, canvasId, tag)

  modder.addOption(createOption(cube, tag, 'orient'), 'orient')
  modder.setHandler('orient', rotateCube)
  modder.setUpdate('orient', (node, controller) => {
    let chosenLabels = Array.from(
      node.childNodes[1].getElementsByTagName('label')
    )
    let unchosenLabels = Array.from(
      node.childNodes[2].getElementsByTagName('label')
    )
    let { numDims, orientation } = controller.cube
    let directions = ['Left/Right', 'Top/Bottom']

    for (const [i, label] of chosenLabels.entries()) {
      label.innerHTML = orientation[numDims-1-i] + '/'
        + orientation[2*numDims-1-i] + ' (' + directions[i] + ')'
    }

    for (const [i, label] of unchosenLabels.entries()) {
      label.innerHTML = orientation[numDims-1-(i+2)]
    }
  })

  modder.addOption(createOption(cube, tag, 'twist'), 'twist')
  modder.setHandler('twist', makeTwist)

  if (cube.numDims > 3 && cube.dimSize > 3) {
    modder.addOption(createOption(cube, tag, 'layer'), 'layer')
    modder.setHandler('layer', changeLayers)
  }

  modder.addOption(createOption(cube, tag, 'option'), 'option')
  modder.setHandler('option', async (controller, values) => {
    const options = [
      ['reset', 'load', 'save'],
      ['undo', 'redo', 'begin', 'end']
    ]
    let type = options[values[0]][values[values[0]+1]]
    const actions = new Map([
      ['undo', (controller) => controller.undoMove(1)],
      ['redo', (controller) => controller.redoMove(1)],
      ['begin', (controller) => controller.undoMove()],
      ['end', (controller) => controller.redoMove()]
    ])
    let action = actions.get(type) ||
      (() => { throw Error('Move not implemented') })
    await action(controller)
  })

  modder.update()
  return modder
}

