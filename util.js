/*
  A utility module for other functions that do not fit the specialized
  utility modules

  These include functions involving orientations, but are not simple
  operations from group theory
*/
const Util = (function Util() {
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
  function axisRotation(numDims, faceFrom, faceTo) {
    let orientation = Array.from(Array(2*numDims)).map((_, i) => i)
    let cycle = [faceFrom, faceTo]

    cycle = cycle.concat(cycle.map(v => (v+numDims)%(2*numDims)))
    cycle.forEach((_, i) => {
      orientation[cycle[(i+1)%4]] = cycle[i]
    })

    return orientation
  }

  // helper function
  function characterizeFaces(facesChosen, numDims) {
    let numFaces = facesChosen.length;
    let dimsChosen = Array.from(Array(numFaces));
    let sidesChosen = Array.from(Array(numFaces));

    dimsChosen.forEach((_, i) => {
      dimsChosen[i] = facesChosen[i] % numDims;
    });
    sidesChosen.forEach((_, i) => {
      sidesChosen[i] = +(facesChosen[i] >= numDims);
    });

    return { dimsChosen, sidesChosen };
  }

  // helper function
  function calcDimOffsets(cubeDimensions, dimsChosen) {
    let numDims = cubeDimensions.length;
    let product = 1;
    let baseOffsets = Array.from(Array(numDims));
    let offsets = Array.from(Array(numDims));

    cubeDimensions.forEach((v, i) => {
      baseOffsets[i] = product;
      product *= v;
    });
    offsets = offsets.map((_, i) => {
      return baseOffsets[numDims-1-dimsChosen[numDims-1-i]];
    });

    return offsets;
  }

  // helper function
  function calcDimSizes(cubeDimensions, dimsChosen) {
    let numDims = cubeDimensions.length;
    let dimSizes = Array.from(Array(numDims));

    dimSizes.forEach((_, i) => {
      dimSizes[i] = cubeDimensions[numDims-1-dimsChosen[i]];
    });

    return dimSizes;
  }

  function profileDims(cube, orientation) {
    let numDims = cube.dimensions.length;
    let {
      dimsChosen, sidesChosen
    } = characterizeFaces(orientation.slice(0, numDims), numDims);

    let offsets = calcDimOffsets(cube.dimensions, dimsChosen);
    let dimSides = Array.from(sidesChosen).reverse();
    let dimSizes = calcDimSizes(cube.dimensions, dimsChosen);

    return { numDims, offsets, dimSides, dimSizes };
  }

  /*
    Iterates through a large 'list' asynchronously

    Note that the limit needs to be known ahead of time here
  */
  async function load(cb=((_) => 0), limit=-1) {
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

  return {
    profileDims,
    axisRotation,
    load
  }
}())

