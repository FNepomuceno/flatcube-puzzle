const Flatcube = (function Flatcube() {
  async function run() {
    let puz = await Cube.create()
    let vew = await View.createView(puz, "game-view")
    let gam = Modder.create(puz, 'game-options', 'cube')
    gam.addView(vew, "main")
  }

  return {
    run
  }
}())
