function CubePuzzle() {
    var stickerChoices = ["front", "none", "back"];
    var stickersChosen = [0, 0, 0];
    var cubePieces = [];
    for(let i=0; i<3*3*3; i++) {
        let pieceNum = i;
        for(let j=0; j<3; j++) {
            stickersChosen[3-1-j] = stickerChoices[pieceNum%3];
            pieceNum = Math.floor(pieceNum/3);
        }
        var newPiece = new CubePiece(...stickersChosen);
        newPiece.index = i;
        cubePieces.push(newPiece);
    }
    this.pieces = cubePieces;
    this.dimensions = [3, 3, 3];
    this.orientation = [0, 1, 2, 3, 4, 5];
    // this.orientation = [1, 2, 0, 4, 5, 3];
    // this.orientation = [2, 3, 4, 5, 0, 1];
    // this.orientation = [3, 2, 1, 0, 5, 4];
    // this.orientation = [4, 3, 5, 1, 0, 2];
    // this.orientation = [5, 3, 1, 2, 0, 4];
}

function init() {
    console.log("cubepuzzle module loaded");
}
init();
