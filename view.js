const View = function View() {
    function extractStickers(sqr) {
        let stickers = sqr.pieces.map(p => {
            let stickerOr = Orientation.compose(
                p.orientation, sqr.orientation);
            return p.stickers[stickerOr[0]]
        });
        return stickers;
    }

    function setCells() {
        const dim3colors = [
            "#11ee11", // green
            "#cccccc", // white
            "#eeaa11", // orange
            "#1111dd",  // blue
            "#eeee11", // yellow
            "#ee1111" // red
        ];
        const dim4colors = [
            "#FF7777", // light red
            "#77FF77", // light green
            "#7777FF", // light blue
            "#FFFF77", // light yellow
            "#770000", // dark red
            "#007700", // dark green
            "#000077", // dark blue
            "#777700"  // dark yellow
        ];

        let cube = this.cube;
        let numDims = cube.dimensions.length;
        let colors;
        switch(numDims) {
            case 3: colors = dim3colors; break;
            case 4: colors = dim4colors; break;
            default: colors = Array(2*numDims).fill("black");
        }
        let orientation = Array.from(Array(2*numDims)).map((_, i) => i);
        let stickers = extractStickers(
            new Square.SquareView(cube, orientation));
        let cells = this.cells;
        stickers.forEach((v, ind) => {
            cells[ind].style.backgroundColor = v >= 0? colors[v]: "white";
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
