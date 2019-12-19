import { compose, invert, conjugate } from './orientation.mjs'

class Twist {
  constructor(numDims, dimSize, facePicked, layerPicked, orAction) {
    this.numDims = numDims
    this.dimSize = dimSize
    this.facePicked = facePicked
    this.layerPicked = layerPicked
    this.orAction = orAction

    let { srcOrientation, dstOrientation, twsOrientation } =
      this.calculateEffectiveOrientations()
    this.srcOrientation = srcOrientation
    this.dstOrientation = dstOrientation
    this.twsOrientation = twsOrientation

    this.id = this.getId()
  }

  /*
    Computes the identifier for the twist

    The cube properties (numDims, dimSize) are not included in the id
  */
  getId() {
    let idArray = [
      this.facePicked, this.layerPicked, this.dimSize,
      ...this.orAction.slice(1, this.numDims-1)
    ]
    return idArray.map(x => x.toString()).join('-')
  }

  /*
    Calculates the orientations used to twist the cube
  */
  calculateEffectiveOrientations() {
    let srcOrientation = defaultOrientation(this.numDims, this.facePicked)
    let dstOrientation = compose(srcOrientation, this.orAction)
    let twsOrientation = conjugate(srcOrientation, invert(this.orAction))
    return { srcOrientation, dstOrientation, twsOrientation }
  }
}

export function createTwist(numDims, dimSize, facePicked,
    layerPicked, orAction) {
  let twist = new Twist(numDims, dimSize, facePicked, layerPicked, orAction)
  return twist
}

export function invertTwist(twist) {
  let { numDims, dimSize, facePicked, layerPicked } = twist
  let orAction = invert(twist.orAction)

  return createTwist(numDims, dimSize, facePicked, layerPicked, orAction)
}

export function calculateTwist(numDims, dimSize, baseOrientation,
    sideOrientation, twistOrientation, layerPicked) {
  let facePicked = compose(baseOrientation, sideOrientation)[0]
  let orAction = conjugate(invert(sideOrientation), invert(twistOrientation))

  return createTwist(numDims, dimSize, facePicked, layerPicked, orAction)
}

export function randomTwist(numDims=3, dimSize=3, facePicked=-1,
    layerPicked=-1) {
  if (facePicked < 0) facePicked = Math.floor(2*numDims*Math.random())
  if (layerPicked < 0) {
    layerPicked = Math.floor(Math.floor(dimSize/2)*Math.random())
  }

  let faces = [0]
  let sides = [0]
  let choices = Array.from(Array(numDims-1)).map((_, i) => i+1)
  let numFlips = 0
  let canBeDefault = true

  for (let i = numDims-1; i > 0; i--) {
    let numChoices = (i !== 2 && canBeDefault)? 2*i: 2*i-1
    let minChoice = (i !== 2 && canBeDefault)? 0: 1
    let choice = minChoice+Math.floor(numChoices*Math.random())
    if (choice !== 0) canBeDefault = false

    let newFace = choices[choice % i]
    let newSide = +(choice >= i)

    faces.push(newFace)
    sides.push(newSide)
    if (newSide >= 1) numFlips += 1
    choices = choices.filter(n => n !== newFace)
  }

  let numSwaps = 0
  let sortingArray = Array.from(faces)
  for (let i = 0; i < numDims; i++) {
    let index = sortingArray[i]
    while(index != i) {
      [sortingArray[i], sortingArray[index]] =
        [sortingArray[index], sortingArray[i]]
      numSwaps++
      index = sortingArray[i]
    }
  }
  numFlips += numSwaps % 2

  if (numFlips % 2 === 1) {
    sides[numDims-1] = (sides[numDims-1] + 1) % 2
  }

  let orientation = faces.map((v, i) => v + numDims*sides[i])
  orientation = orientation.concat(
    orientation.map(v => (v + numDims) % (2*numDims)))

  let action = orientation

  return createTwist(numDims, dimSize, facePicked, layerPicked, action)
}

export function defaultOrientation(numDims=3, facePicked=0) {
  let orientation = Array.from(Array(2 * numDims))
    .map((_, i) => (i + facePicked) % (2 * numDims))
  if (numDims % 2 === 1 && facePicked % 2 === 1) {
    [orientation[numDims-1], orientation[2*numDims-1]] =
      [orientation[2*numDims-1], orientation[numDims-1]]
  }
  return orientation
}

/*
  Generates the orientation representing a rotation through two axes

  In 3 dimensions, one often thinks of rotations as having an axis,
  but this turns out to be coincidental and isn't the true pattern
  of rotations in N dimensions

  Really there are two axes that an object rotates through and the
  hyper-plane represented by the remaining N-2 axes is what the
  object rotates around

  For an N-dimensional cube, each of the 2*N faces have an associated
  axis: the axis that the face excludes. This way we can treat the
  rotations through two axes as relating to faces instead of axes
*/
export function cycleOrientation(numDims, faceFrom, faceTo) {
  let orientation = defaultOrientation(numDims)
  let cycle = [faceFrom, faceTo]

  cycle = cycle.concat(cycle.map(v => (v+numDims)%(2*numDims)))
  cycle.forEach((_, i) => {
    orientation[cycle[(i+1)%4]] = cycle[i]
  })

  return orientation
}

export function completeTwistAction(values) {
  let [face, layer, dimSize, ...orPieces] = values
  let numDims = orPieces.length+2

  // Calculate dimensions for number of swaps
  let dimensions = orPieces.map(n => n%numDims)
  let pieceSum = dimensions.reduce((a, b) => a+b, 0)
  let missingDim = (numDims*numDims-numDims)/2 - pieceSum
  dimensions.push(missingDim)

  // Calculate number of swaps
  let numSwaps = 0
  for (let i = 1; i < numDims; i++) {
    while (dimensions[i-1] !== i) {
      let curVal = dimensions[i-1]
      let nextVal = dimensions[curVal-1]
      dimensions[curVal-1] = curVal
      dimensions[i-1] = nextVal
      numSwaps++
      if (numSwaps > 50) throw Error('infinite loop')
    }
  }
  numSwaps = orPieces.reduce((a, b) => a + (b >= numDims), numSwaps)

  // Calculate orAction
  let orAction = Array.from(orPieces)
  orAction.unshift(0)
  orAction.push(missingDim + (numSwaps % 2)*numDims)
  orAction = orAction.concat(orAction.map(d => (d+numDims)%(2*numDims)))

  // Make twist from parameters
  let twist = createTwist(numDims, dimSize, face, layer, orAction)
  return twist
}

