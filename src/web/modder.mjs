import { axisRotation } from '../core/util.mjs'
import { twistCube } from '../core/slice.mjs'

class Modder {
  constructor(cube, canvasId, tag) {
    this.cube = cube
    this.canvas = document.getElementById(canvasId)
    this.tag = tag
    this.views = new Map()
    this.sections = [] // corresponds with orient, twist, ...
    // and contains the inputs and buttons
  }

  addSection(section) {
    this.sections.push(section)
    this.canvas.appendChild(section.node)
  }

  addView(view, key) {
    this.views.set(key, view)
  }

  update() {
    let { orientation, numDims } = this.cube
    let chosenLabels = this.sections[0].radios[0].labels
    let unchosenLabels = this.sections[0].radios[1].labels
    let dirChoice = +(this.sections[0].radios[2].radios
      .filter(elem => elem.checked)[0].value)
    const labelDirections = [['Left', 'Top'], ['Right', 'Bottom']]

    chosenLabels.forEach((label, i) => {
      label.innerHTML = (orientation[numDims-1-i+dirChoice*numDims])
        + ' (' + labelDirections[dirChoice][i] + ')'
    })
    unchosenLabels.forEach((label, i) => {
      label.innerHTML = orientation[numDims-1-(i+2)]
    })
  }
}

class ModSection {
  constructor(title) {
    this.node = document.createElement('div')
    this.title = document.createElement('h3')
    this.radios = []
    this.button = document.createElement('button')

    this.title.innerHTML = title
    this.node.appendChild(this.title)
  }

  addRadio(radio) {
    this.radios.push(radio)
    this.node.insertBefore(radio.node, this.button)
  }

  /*
    Sets the button of the newly created object
  */
  setButton(btnValue, btnId) {
    this.button.type = 'button'
    this.button.id = btnId
    this.button.innerHTML = btnValue
    this.button.style.marginTop = '1em'
    this.node.appendChild(this.button)
  }

  getOptions() {
    return this.radios.map(radio => {
      return +(radio.radios.filter(elem => elem.checked)[0].value)
    })
  }

  setHandler(handler, modder, ...args) {
    this.button.addEventListener('click', async () => {
      await handler.call(this, ...args)

      modder.views.forEach(view => {
        view.setCells()
      })

      modder.update()
    })
  }
}

class ModRadio {
  constructor(title) {
    this.node = document.createElement('div')
    this.title = document.createElement('h4')
    this.radios = []
    this.labels = []

    this.title.innerHTML = title
    this.node.appendChild(this.title)
  }

  setRadios(name, values) {
    values.forEach((value, i) => {
      let newContainer = document.createElement('div')
      let newRadio = document.createElement('input')
      let newLabel = document.createElement('label')

      newRadio.type = 'radio'
      newRadio.name = name
      newRadio.value = i
      newRadio.id = `${name}-${i}`
      if (i === 0) newRadio.checked = true
      newLabel.htmlFor = newRadio.id
      newLabel.innerHTML = value

      this.radios.push(newRadio)
      this.labels.push(newLabel)
      newContainer.appendChild(newRadio)
      newContainer.appendChild(newLabel)
      this.node.appendChild(newContainer)
    })
  }
}

function newSection(modder, title, btnValue, btnId) {
  let section = new ModSection(title)

  section.setButton(btnValue, btnId)
  modder.addSection(section)

  return section
}

function newRadio(section, title, name, values) {
  let radio = new ModRadio(title)

  radio.setRadios(name, values)
  section.addRadio(radio)
}

function addOrientSection(modder, tag) {
  let orientSec = newSection(modder, 'Re-orient Cube', 'Rotate',
    `${tag}-rotButton`)

  newRadio(orientSec, 'Displayed Dimensions', `${tag}-dimX`,
    Array(2).fill(-1))
  newRadio(orientSec, 'Undisplayed Dimensions', `${tag}-dimY`,
    Array(modder.cube.numDims-2).fill(-1))
  newRadio(orientSec, 'Rotation Direction', `${tag}-rotD`,
    ['Forward', 'Backward'])
  orientSec.radios[2].node.addEventListener('click', () =>
    modder.update())

  orientSec.setHandler(rotateCube, modder, modder.cube)
}

function addTwistSection(modder, tag) {
  let twistSec = newSection(modder, 'Twist Cube', 'Twist',
    `${tag}-twsButton`)

  newRadio(twistSec, 'Select Side', `${tag}-twsS`,
    ['Top', 'Left', 'Bottom', 'Right'])
  newRadio(twistSec, 'Twist Direction', `${tag}-twsD`,
    ['Forward', 'Backward'])
  newRadio(twistSec, 'Twist Layer', `${tag}-twsL`,
    Array.from(Array(~~(modder.cube.dimSize/2)))
      .map((_, i) => `Layer ${i}`),
    tag)

  twistSec.setHandler(makeTwist, modder, modder.cube)
}

function addViewSection(modder, tag) {
  let viewSec = newSection(modder, 'Change View', 'Change',
      `${tag}-vewButton`)
  for(let d = 3; d < modder.cube.numDims; d++) {
    newRadio(viewSec, `Dimension ${d}`, `${tag}-vew${d}`,
      Array.from(Array(~~(modder.cube.dimSize/2)))
        .map((_, i) => `Layer ${i}`),
      tag)
  }

  viewSec.setHandler(function(views) {
    let newLayers = this.getOptions()
    newLayers.push(0)
    views.forEach(view => {
      view.layers = newLayers
    })
  }, modder, modder.views)
}

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
function rotateCube(cube) {
  cube.rotate(calcRotateOrientation(cube.numDims, ...this.getOptions()))
}

function sideOrientation(numDims, sidePicked) {
  // convert to chosen/unchosen in other handler
  let dimA = numDims-2+(sidePicked % 2), dimB = 0
  let direction = +(sidePicked >= 2)

  // generate cycle and orientation
  let dimRotation = direction == 0? [dimA, dimB]: [dimB, dimA]
  let orientation = axisRotation(numDims, ...dimRotation)

  return orientation
}

function calcTwistOrientations(numDims, sidePicked,
    twistDirection, layerChoice) {
  let twistSide = (4 + sidePicked + Math.pow(-1, twistDirection + 1)) % 4

  let dstOrientation = sideOrientation(numDims, sidePicked)
  let twsOrientation = sideOrientation(numDims, twistSide)

  return [dstOrientation, twsOrientation, layerChoice]
}

/*
  Twists the cube according to the options set on the modder
*/
async function makeTwist(cube) {
  await twistCube(cube, ...calcTwistOrientations(
    cube.numDims, ...this.getOptions()))
}

export function createModder(cube, canvasId, tag) {
  let modder = new Modder(cube, canvasId, tag)

  addOrientSection(modder, tag)
  addTwistSection(modder, tag)
  if (cube.numDims > 3 && cube.dimSize > 3) {
    addViewSection(modder, tag)
  }

  modder.update()
  return modder
}

