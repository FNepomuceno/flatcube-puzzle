const Cube = function Cube() {
    /*
        Constructs a cube puzzle
    */
    function CubePuzzle(numDims=3, dimSize=3) {
        let stickersChosen = Array.from(Array(numDims));
        let numStickers = Math.pow(dimSize, numDims);
        let cubePieces = [];
        for(let i=0; i < numStickers; i++) {
            let pieceNum = i;
            for(let j=0; j < numDims; j++) {
                let pieceMod = pieceNum % dimSize;
                let choice = pieceMod == 0? "front":
                    pieceMod == dimSize-1? "back": "none";
                stickersChosen[numDims-1-j] = choice;
                pieceNum = ~~(pieceNum/dimSize);
            }
            var newPiece = new Piece.CubePiece(...stickersChosen);
            cubePieces.push(newPiece);
        }
        this.pieces = cubePieces;
        this.dimensions = Array(numDims).fill(dimSize);
        this.orientation = Array.from(Array(2*numDims)).map((_, i) => i);
    }

    console.log('Cube Puzzle Module loaded');
    return {
        CubePuzzle
    };
}();
