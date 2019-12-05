const Flatcube = (function Flatcube() {
  function getParams() {
    let urlParams = new URLSearchParams(window.location.search)
    let numDims
    let dimSize

    if(urlParams.has('numDims')) {
      let param = +urlParams.get('numDims')
      if(!isNaN(param) && param >= 3) {
        numDims = param
      } else {
        console.error('Invalid dimension amount. Resetting to 3')
      }
    } else {
      numDims = 3
    }

    if(urlParams.has('dimSize')) {
      let param = +urlParams.get('dimSize')
      if(!isNaN(param) && param >= 2) {
        dimSize = param
      } else {
        console.error('Invalid dimension size. Resetting to 3')
      }
    } else {
      dimSize = 3
    }

    if(Math.pow(dimSize, numDims) > 5000000) {
      console.error('Puzzle too large. Resetting to 3^3')
      numDims = 3
      dimSize = 3
    }

    return [numDims, dimSize]
  }

  async function run(numDims, dimSize) {
    let puz = await Cube.create(numDims, dimSize)
    let vew = await View.create(puz, 'game-view')
    let gam = Modder.create(puz, 'game-options', 'cube')
    gam.addView(vew, 'main')
  }

  return {
    run,
    getParams
  }
}())
