const View = function View() {
    function extractStickers(sqr) {
        let stickers = sqr.pieces.map(p => {
            let stickerOr = Util.rotateOrientation(
                p.orientation, sqr.orientation);
            return p.stickers[stickerOr[0]]
        });
        return stickers;
    }

    function setCells() {
        const colors = [
            "#eeee11", // yellow
            "#ee1111", // red
            "#11ee11", // green
            "#cccccc", // white
            "#eeaa11", // orange
            "#1111dd"  // blue
        ];

        let cube = this.cube;
        let numDims = cube.dimensions.length;
        let orientation = Array.from(Array(2*numDims)).map((_, i) => i);
        let stickers = extractStickers(
            new Square.SquareView(cube, orientation));
        let cells = this.cells;
        stickers.forEach((v, ind) => {
            cells[ind].style.backgroundColor = colors[v];
            cells[ind].title = `Face ${v}`;
        });
    }

    // constructor for GameView object
    function GameView(cube, canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.cube = cube;
        this.cells = [];
        this.setCells = setCells;

        let sqrView = new Square.SquareView(cube);
        [this.numCols, this.numRows] = sqrView.dimensions;

        this.canvas.style.display = "grid";
        this.canvas.style.gridTemplateRows =
            `repeat(${this.numRows}, 4em)`;
        this.canvas.style.gridTemplateColumns =
            `repeat(${this.numCols}, 4em)`;

        for(let i = 0; i < this.numCols*this.numRows; i++) {
            let cell = document.createElement("div");
            cell.className = "cell";
            this.canvas.appendChild(cell);
            this.cells.push(cell);
        }

        this.setCells();
    }

    console.log('View Module loaded');
    return {
        GameView
    };
}();
