function profileDims(cube, orOffset) {
    let numDims = cube.dimensions.length;
    let orientation = cube.orientation;
    let faceChoices = Array.from(Array(numDims));
    let chosenDims = Array.from(Array(numDims));

    if(orOffset === null) {
		orOffset = Array.from(Array(numDims*2)).map((_, ind) => ind);
	}
	orientation = rotateOrientation(orientation, orOffset);

    faceChoices.forEach((_, ind) => {
        faceChoices[ind] = orientation[ind] >= numDims;
    });
    chosenDims.forEach((_, ind) => {
        chosenDims[ind] = orientation[ind] % 3;
    });

    return { numDims, faceChoices, chosenDims, orientation };
}

function dimOffsets(numDims, dimensions, chosenDims) {
    let baseOffsets = Array.from(Array(numDims));
    let offsets = Array.from(Array(numDims));
    let product = 1;

    baseOffsets.forEach((_, ind) => {
        baseOffsets[ind] = product;
        product *= dimensions[ind];
    });
    offsets.forEach((_, ind) => {
        offsets[ind] = baseOffsets[numDims-1-chosenDims[numDims-1-ind]];
    });

    return offsets;
}

function squareSlice(cube, orOffset=null) {
    let {
        numDims, faceChoices, chosenDims, orientation
    } = profileDims(cube, orOffset);
    let offsets = dimOffsets(numDims, cube.dimensions, chosenDims);

    let dimSizes = Array.from(Array(numDims));
    dimSizes.forEach((_, ind) => {
        dimSizes[ind] = cube.dimensions[numDims-1-chosenDims[ind]];
    });

    let dimReverse = Array.from(faceChoices).reverse();
    let dimFunc = (dim, v) => dimReverse[dim]? dimSizes[dim]-1-v: v;

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
    
    return {
        pieces: pieces.map(v => cube.pieces[v]),
        dimensions: dimSizes.slice(0, 2),
        orientation
    };
}

function faceStickers({pieces, orientation}) {
    let stickers = pieces.map(p => {
        let stickerChoices = "ABCabc".split("");
        let stickerChosen = p.stickers[orientation[0]];
        let colorIndex = stickerChoices.indexOf(stickerChosen);
        return colorIndex;
    });
    return stickers;
}

function setDivCells(cube) {
    let colors = [
      "#eeee11", // yellow
      "#ee1111", // red
      "#11ee11", // green
      "#cccccc", // white
      "#eeaa11", // orange
      "#1111dd"  // blue
    ];

    let stickers = faceStickers(squareSlice(cube));
    let cells = document.getElementsByClassName("cell");
    stickers.forEach((v, ind) => {
        cells[ind].style.backgroundColor = colors[v];
        cells[ind].title = `Face ${v}`;
    });
}

function init() {
    console.log("cubeview module loaded");
}
init();
