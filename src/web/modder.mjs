import { axisRotation } from '../core/util.mjs'
import { createController } from '../core/controller.mjs'
import { createOption } from './option.mjs'

class Modder {
  constructor(cube, canvasId, tag) {
    this.controller = createController(cube)
    this.canvas = document.getElementById(canvasId)
    this.views = new Map()
    this.options = new Map() // corresponds with orient, twist, ...
    // and contains the inputs and buttons
  }

  addOption(option, type) {
    this.options.set(type, option)
    this.canvas.appendChild(option.node)
  }

  addView(view, key) {
    this.views.set(key, view)
    this.controller.addView(view.view)
  }

  update() {
    let { orientation, numDims } = this.controller.cube
    // TODO: Fix labels for displayed and undisplayed dimensions
  }

  setHandler(type, cb=()=>0, ...args) {
    let option = this.options.get(type)
    let button = option.node.getElementsByTagName('button')[0]
    button.addEventListener('click', async () => {
      await cb(this.controller, option.poll())

      this.views.forEach(view => {
        view.setCells()
      })
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
  let cube = controller.cube
  let numDims = cube.numDims
  let [sidePicked, twistDirection, layerPicked] = values
  let baseFace = cube.orientation[0]

  let sideChoices = [numDims-2, numDims-1, 2*numDims-2, 2*numDims-1]
  let sideFace = cube.orientation[sideChoices[sidePicked]]

  let sideOffset = Math.pow(-1, twistDirection)
  let twistFace = cube.orientation[sideChoices[(4+sidePicked+sideOffset)%4]]

  await controller.applyTwist(baseFace, sideFace, twistFace, layerPicked)
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

  modder.addOption(createOption(cube, tag, 'twist'), 'twist')
  modder.setHandler('twist', makeTwist)

  if (cube.numDims > 3 && cube.dimSize > 3) {
    modder.addOption(createOption(cube, tag, 'layer'), 'layer')
    modder.setHandler('layer', changeLayers)
  }

  modder.addOption(createOption(cube, tag, 'option'), 'option')
  modder.setHandler('option', (controller, values) => {
    console.log(controller, inputs)
  })

  modder.update()
  return modder
}

