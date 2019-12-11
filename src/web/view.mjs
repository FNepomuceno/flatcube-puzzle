import { create as createSlice } from '../core/slice.mjs'

const dimensionColors = [
  [ // dimension 3
    '#11EE11', '#CCCCCC', '#EEAA11',
    '#1111DD', '#EEEE11', '#EE1111'
  ],
  [ // dimension 4
    '#FF7777', '#77FF77', '#FFFF77', '#7777FF',
    '#770000', '#007700', '#777700', '#000077'
  ],
  [ // dimension 5
    '#8080FF', '#00FFFF', '#80FF80', '#FFFF00', '#FF8080',
    '#804000', '#800040', '#400080', '#004080', '#00C040'
  ],
  [ // dimension 6
    '#8080FF', '#00FFFF', '#80FF80', '#FFFF00', '#FF8080', '#FF00FF',
    '#804000', '#800040', '#400080', '#004080', '#00C040', '#408000'
  ],
  [ // dimension 7
    '#8080FF', '#00FFFF', '#80FF80', '#FFFF00',
    '#FF8080', '#FF00FF', '#C0C0C0',
    '#804000', '#800040', '#400080', '#004080',
    '#00C040', '#408000', '#404040'
  ]
]

class View {
  constructor(cube, canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.cube = cube
    this.cells = []
    this.layers = Array(cube.numDims-2).fill(0)
  }

  async setView() {
    let orientation = Array.from(Array(2*this.cube.numDims))
      .map((_, i) => i)
    let numCols = this.cube.dimSize
    let numRows = this.cube.dimSize

    this.canvas.style.display = 'grid'
    this.canvas.style.gridTemplateRows =
      `repeat(${numRows}, 4em)`
    this.canvas.style.gridTemplateColumns =
      `repeat(${numCols}, 4em)`

    for(let i = 0; i < numCols*numRows; i++) {
      let cell = document.createElement('div')
      cell.className = 'cell'
      this.canvas.appendChild(cell)
      this.cells.push(cell)
    }

    await this.setCells()
  }

  async setCells() {
    let colors = dimensionColors[this.cube.numDims-3]
    let orientation = Array.from(Array(2*this.cube.numDims))
      .map((_, i) => i)
    let slice = await createSlice(this.cube, orientation, 2, this.layers)
    let stickers = slice.indices.map(i => {
      return slice.cube.pieces[i].getSticker(slice.orientation)
    })

    if(colors === undefined) {
      colors = Array(2*this.cube.numDims).fill('black')
    }

    stickers.forEach((v, i) => {
      this.cells[i].style.backgroundColor = v >= 0? colors[v]: 'white'
      this.cells[i].title = `Face ${v}`
    })
  }
}

export async function create(cube, canvasId) {
  let newView = new View(cube, canvasId)

  await newView.setView()
  return newView
}

