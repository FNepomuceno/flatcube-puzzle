import { compose, invert, conjugate } from './orientation.mjs'

class Twist {
  constructor(numDims, dimSize, facePicked, layerPicked, orAction) {
    this.numDims = numDims
    this.dimSize = dimSize
    this.facePicked = facePicked
    this.layerPicked = layerPicked
    this.orAction = orAction

    let { srcOrientation, dstOrientation} =
      this.calculateEffectiveOrientations()
    this.srcOrientation = srcOrientation
    this.dstOrientation = dstOrientation

    this.id = this.getId()
  }

  /*
    Computes the identifier for the twist

    The cube properties (numDims, dimSize) are not included in the id
  */
  getId() {
    let idArray = [
      this.facePicked, this.layerPicked,
      ...this.orAction.slice(0, this.numDims)
    ]
    return idArray.map(x => x.toString()).join('-')
  }

  /*
    Calculates the orientations used to twist the cube
  */
  calculateEffectiveOrientations() {
    let srcOrientation = defaultOrientation(this.numDims, this.facePicked)
    let dstOrientation = compose(srcOrientation, this.orAction)
    return { srcOrientation, dstOrientation }
  }
}

export function createTwist(numDims, dimSize, facePicked,
    layerPicked, orAction) {
  let twist = new Twist(numDims, dimSize, facePicked, layerPicked, orAction)
  return twist
}

export function calculateTwist(numDims, dimSize, baseOrientation,
    sideOrientation, twistOrientation, layerPicked) {
  let facePicked = compose(baseOrientation, sideOrientation)[0]
  let orAction = conjugate(invert(sideOrientation), invert(twistOrientation))
  return createTwist(numDims, dimSize, facePicked, layerPicked, orAction)
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

