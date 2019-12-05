const Flatcube = (function Flatcube() {
  async function run() {
    // The puzzle below creates 8^7 pieces (about 2.1 million)
    // let puz = await Cube.create(7, 8)
    let puz = await Cube.create()
    let vew = await View.createView(puz, "game-view")
    let con = new Modder.GameController(puz, "game-options", "game")
    con.addView(vew, "main")
  }

  return {
    run
  }
}())
