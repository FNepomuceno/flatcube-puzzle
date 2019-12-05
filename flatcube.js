const Flatcube = (function Flatcube() {
  async function run() {
    // The puzzle below creates 8^7 pieces (about 2.1 million)
    // let puz = await Cube.create(7, 8)
    let puz = await Cube.create()
    let vew = await View.createView(puz, "game-view")
    let gam = Modder.create(puz, 'game-options', 'cube')
    gam.addView(vew, "main")
  }

  return {
    run
  }
}())
