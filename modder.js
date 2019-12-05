const Modder = (function Modder() {
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
  }

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
  }

  function newRadio(section, title, name, values) {
    let radio = new ModRadio(title)

    radio.setRadios(name, values)
    section.addRadio(radio)
  }

  function newSection(modder, title, btnValue, btnId) {
    let section = new ModSection(title)

    section.setButton(btnValue, btnId)
    modder.addSection(section)

    return section
  }

  function create(cube, canvasId, tag) {
    let modder = new Modder(cube, canvasId, tag)
    let orientSec = newSection(modder, 'Re-orient Cube', 'Rotate',
      `${tag}-rotButton`)
    let twistSec = newSection(modder, 'Twist Cube', 'Twist',
      `${tag}-twsButton`)

    newRadio(orientSec, 'Displayed Dimensions', `${tag}-dimX`,
      Array(2).fill(-1))
    newRadio(orientSec, 'Undisplayed Dimensions', `${tag}-dimY`,
      Array(cube.numDims-2).fill(-1))
    newRadio(orientSec, 'Rotation Direction', `${tag}-rotD`,
      ['Forward', 'Backward'])
    orientSec.radios[2].node.addEventListener('click', () =>
      update(modder))

    newRadio(twistSec, 'Select Side', `${tag}-twsS`,
      ['Top', 'Left', 'Bottom', 'Right'])
    newRadio(twistSec, 'Twist Direction', `${tag}-twsD`,
      ['Forward', 'Backward'])

    orientSec.button.addEventListener('click', () =>
      rotateCube(modder))
    twistSec.button.addEventListener('click', () =>
      twistCube(modder))

    update(modder)

    return modder
  }

  function update(modder) {
    let { orientation, numDims } = modder.cube
    let chosenLabels = modder.sections[0].radios[0].labels
    let unchosenLabels = modder.sections[0].radios[1].labels
    let dirChoice = +(modder.sections[0].radios[2].radios
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

  function rotateCube(modder) {
    let displayedChoice = +(modder.sections[0].radios[0].radios
      .filter(elem => elem.checked)[0].value)
    let undisplayedChoice = +(modder.sections[0].radios[1].radios
      .filter(elem => elem.checked)[0].value)
    let displayedDim = modder.cube.numDims-1-displayedChoice
    let undisplayedDim = modder.cube.numDims-3-undisplayedChoice
    let orientDirection = +(modder.sections[0].radios[2].radios
      .filter(elem => elem.checked)[0].value)
    let numDims = modder.cube.numDims

    // get rotation orientation
    let dimRotation = orientDirection == 0?
      [displayedDim, undisplayedDim]: [undisplayedDim, displayedDim]
    let orientation = Util.axisRotation(numDims, ...dimRotation)

    // rotate cube
    // move to Cube as Cube#rotate(orientation)
    modder.cube.orientation = Orientation.compose(
      modder.cube.orientation, orientation)

    // update views
    modder.views.forEach(view => {
      view.setCells()
    })

    // update options
    update(modder)
  }

  function sideOrientation(numDims, sidePicked) {
    // convert to chosen/unchosen in other handler
    let dimA = numDims-2+(sidePicked % 2), dimB = 0
    let direction = +(sidePicked >= 2)

    // generate cycle and orientation
    let dimRotation = direction == 0? [dimA, dimB]: [dimB, dimA]
    let orientation = Util.axisRotation(numDims, ...dimRotation)

    return orientation
  }

  async function twistCube(modder) {
    let numDims = modder.cube.numDims
    let sidePicked = +modder.sections[1].radios[0].radios
      .filter(elem => elem.checked)[0].value
    let twistDirection = +modder.sections[1].radios[1].radios
      .filter(elem => elem.checked)[0].value
    let twistSide = (4+sidePicked+Math.pow(-1, twistDirection+1)) % 4

    let dstOrientation = sideOrientation(numDims, sidePicked)
    let twsOrientation = sideOrientation(numDims, twistSide)
    let srcOrientation = Orientation.compose(twsOrientation,
      dstOrientation)

    // get indices of pieces to rotate
    let dstIndices = (await Slice.create(modder.cube,
      dstOrientation, numDims-1)).indices
    let srcIndices = (await Slice.create(modder.cube,
      srcOrientation, numDims-1)).indices

    // get pieces of cube
    let pieces = srcIndices.map(v => modder.cube.pieces[v])

    // make the twist
    pieces.forEach((p, i) => {
      p.twist(twsOrientation, modder.cube.orientation)
      modder.cube.pieces[dstIndices[i]] = p
    })

    // update views
    modder.views.forEach(view => {
      view.setCells()
    })

    // update options
    update(modder)
  }

  return {
    create
  }
}())
