const Flatcube = function Flatcube() {
    function run() {
        // note to self: do this asynchronously or otherwise large puzzles
        // like the 8^8 puzzle WILL lag the browser
        // Hint: that's over 16 million pieces total
        //   (is there even enough space for that many pieces?)
        let puz = new Cube.CubePuzzle();
        let vew = new View.GameView(puz, "game-view");
        let con = new Modder.GameController(puz, "game-options", "game");
        con.addView(vew, "main");
        console.log(con);
    }

    console.log('FlatCube Module loaded');
    return {
        run
    };
}();
