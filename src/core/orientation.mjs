/*
  A utility module dedicated to manipulating orientations

  Orientations of an N-dimensional cube are represented by a permutation
  of the 2*N (N-1 dimensional) faces on the cube

  By Cayley's Theorem, the group of orientations of an N-dimensional group
  are isomorphic to a subgroup of a permutation group. In other words,
  the set of permutations of the faces of the cube form a subgroup of
  a permutation group

  This means that we can use a representation of the orientations of the
  N-dimensional cube that is easier to manipulate (an array representing
  the permutation of the cube
*/

/*
  Composes two orientations together.

  The orientations given in the parameters orientationA(orA) and
  orientationB(orB) are applied in the order orA first, then orB second.
  In more mathematical lingo, the result can be expressed as orB.orA
  (where . is the composition operator)
*/
export function compose(orientationA, orientationB) {
  let newOrientation = Array.from(orientationA).map(
    (_, i) => orientationA[orientationB[i]]
  )

  return newOrientation
}

/*
  Gets the inverse orientation of the one given
*/
export function invert(orientation) {
  let newOrientation = Array.from(Array(orientation.length))
  orientation.forEach((v, i) => {
    newOrientation[v] = i
  })
  return newOrientation
}

/*
  Calculates the conjugation of orientationB(orB) through
  orientationA(orA)
*/
export function conjugate(orientationA, orientationB) {
  let inverseA = invert(orientationA)
  let result = compose(orientationA,
    compose(orientationB, inverseA))
  return result
}

