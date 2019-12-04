const Square = function Square() {
    //helper function
    function getPieceIndices(dimSizes, dimSides, offsets) {
        let numDims = dimSizes.length;
        let dimFunc = (dim, v) => dimSides[dim]? dimSizes[dim]-1-v: v;

        let pieces = Array.from(Array(dimSizes[0]*dimSizes[1]));
        let indices = Array(numDims).fill(0);
        for(indices[1] = 0; indices[1] < dimSizes[1]; indices[1]++) {
            for(indices[0] = 0; indices[0] < dimSizes[0]; indices[0]++) {
                let pieceIndex = indices[1]*dimSizes[0]+indices[0];
                pieces[pieceIndex] = 0;
                for(let d = 0; d < numDims; d++) {
                    pieces[pieceIndex] += dimFunc(d, indices[d])*offsets[d];
                }
            }
        }
        return pieces;
    }

    /*
        Returns a view of the given cube with respect to the given
        orientation. The view is reduced to a 2D square containing just
        the pieces along with the orientation with which to look at
        the pieces
    */
    function SquareView(cube, orRotate=null) {
        let numDims = cube.dimensions.length;
        if(orRotate === null) {
            orRotate = Array.from(Array(2*numDims)).map((_, i) => i);
        }

        let orView = Orientation.compose(cube.orientation, orRotate);
        let {
            offsets, dimSides, dimSizes
        } = Util.profileDims(cube, orView);
        let pieceIndices = getPieceIndices(dimSizes, dimSides, offsets);

        this.pieces = pieceIndices.map(v => cube.pieces[v]);
        this.indices = pieceIndices;
        this.dimensions = dimSizes.slice(0, 2);
        this.orientation = orView;
    }

    console.log('Square Module loaded');
    return {
        SquareView
    };
}();
