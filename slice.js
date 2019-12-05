const Slice = (function Slice() {
    class Slice {
      constructor(cube, orientation, numDims) {
        this.cube = cube
        this.orientation = Orientation.compose(cube.orientation,
          orientation)
        this.numDims = numDims
        this.dimSize = cube.dimSize
        this.indices = []
        this.pieces = [] // to be removed soon
      }

      /*
        Helper function for setIndices to get sides and offsets
      */
      indexParams() {
        // get axes and sides from orientation
        let faces = Array.from(this.orientation)
          .slice(0, this.cube.numDims)
          .reverse()
        let sides = faces.map(f => ~~(f / this.cube.numDims))
        let axes = faces.map(f => {
          return this.cube.numDims - 1 - (f % this.cube.numDims)
        })

        // get offsets from axes
        let baseOffsets = Array.from(Array(this.cube.numDims))
          .map((_, i) => Math.pow(this.dimSize, i))
        let offsets = Array.from(Array(this.cube.numDims))
          .map((_, i) => baseOffsets[axes[i]])

        return { sides, offsets }
      }

      /*
        Sets the indices of the Slice

        For now, the dimIndices are set to 0. In the future, the portion
        of the dimIndices that won't be affected by the (j) for loop will
        access different layers of the cube
      */
      async setIndices() {
        let { sides, offsets } = this.indexParams()
        let dimIndices = Array(this.cube.numDims).fill(0)
        let numIndices = Math.pow(this.dimSize, this.numDims)

        await Util.load((i) => {
          let indexVal = i
          let newIndex = 0

          for (let j = 0; j < this.numDims; j++) {
            let indexMod = indexVal % this.dimSize
            dimIndices[j] = indexMod
            indexVal = ~~(indexVal/this.dimSize)
          }
          for (let k = 0; k < this.cube.numDims; k++) {
            let amtOffset = sides[k] === 0?
              dimIndices[k]:  this.dimSize-1-dimIndices[k]
            newIndex += amtOffset * offsets[k]
          }
          this.indices.push(newIndex)
        }, numIndices)

        this.pieces = this.indices.map(i => this.cube.pieces[i])
      }
    }

  /*
    Creates a new Slice
  */
  async function create(cube, orientation, numDims) {
    let newSlice = new Slice(cube, orientation, numDims)

    await newSlice.setIndices()
    return newSlice
  }

  return {
    create
  }
}())

