import { compose } from './orientation.mjs'
import { defaultOrientation } from './twist.mjs'
import { createSlice } from './cube.mjs'

class View {
  constructor(cube, orientation, layers) {
    this.cube = cube
    this.orientation = orientation
    this.layers = layers
    this.stickers = Array(cube.dimSize * cube.dimSize).fill(-1)
  }

  async update() {
    let slice = await createSlice(
      this.cube,
      compose(this.cube.orientation, this.orientation),
      2,
      this.layers
    )
    this.stickers = slice.indices.map(i => {
      return slice.cube.pieces[i].getSticker(slice.orientation)
    })
  }

  changeLayer(layerIndex, layerChoice) {
    this.layers[layerIndex] = layerChoice
  }
}

export function createView(cube, orientation, layers) {
    if (orientation === undefined) {
      orientation = defaultOrientation(cube.numDims)
    }
    if (layers === undefined) {
      layers = Array(cube.numDims-2).fill(0)
    }

    let view = new View(cube, orientation, layers)

    return view
}
