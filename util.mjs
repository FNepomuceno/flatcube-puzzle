/*
  A utility module for other functions that do not fit the specialized
  utility modules

  These include functions involving orientations, but are not simple
  operations from group theory
*/

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
export function axisRotation(numDims, faceFrom, faceTo) {
  let orientation = Array.from(Array(2*numDims)).map((_, i) => i)
  let cycle = [faceFrom, faceTo]

  cycle = cycle.concat(cycle.map(v => (v+numDims)%(2*numDims)))
  cycle.forEach((_, i) => {
    orientation[cycle[(i+1)%4]] = cycle[i]
  })

  return orientation
}

/*
  Iterates through a large 'list' asynchronously

  Note that the limit needs to be known ahead of time here
*/
export async function load(cb=((_) => 0), limit=-1) {
  const threshold = 1000
  let totalCount = 0
  let iterCount = 0
  while (limit < 0 || totalCount < limit) {
    if (iterCount >= threshold) {
      iterCount = 0
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 0)
      })
    }
    cb(totalCount)
    totalCount++
    iterCount++
  }
}

