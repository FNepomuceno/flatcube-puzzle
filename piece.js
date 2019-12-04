const Piece = function Piece() {
    /*
        Constructs a new cube piece

        For each dimension, there could be a sticker on one of the opposite
        pair of faces, or none (but not on both faces), represented with
        the choices "front", "back", and "none"

        The orientation is listed as a permutation of the 6 faces of the
        cube, hence the 6 entries of the orientation being numbers 0-5.
    */
    function CubePiece(...stickersChosen) {
        let numDims = stickersChosen.length;
        let stickers = Array.from(Array(2*numDims)).map((_, i) => i);
        let orientation = Array.from(Array(2*numDims)).map((_, i) => i);
        for(let i=0; i < numDims; i++) {
            if(stickersChosen[i] == "none") {
                stickers[i] = -1;
                stickers[i+numDims] = -1;
            } else if(stickersChosen[i] == "front") {
                stickers[i+numDims] = -1;
            } else if(stickersChosen[i] == "back") {
                stickers[i] = -1;
            } else {
                throw Error("invalid sticker choice");
            }
        }
        this.stickers = stickers;
        this.dimensions = numDims;
        this.orientation = orientation;
    }

    console.log('Piece Module loaded');
    return {
        CubePiece
    };
}();
