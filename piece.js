/*
    Constructs a new cube piece

    For each dimension, there could be a sticker on one of the opposite
    pair of faces, or none (but not on both faces)

    Currently, the puzzle emulated is the Rubik's cube which has 3
    dimensions

    The orientation is listed as a permutation of the 6 faces of the cube,
    hence the 6 entries of the orientation being numbers 0-5.
*/
function CubePiece(d1Sticker, d2Sticker, d3Sticker) {
    var stickers = "ABCabc".split("");
    var stickersChosen = [d1Sticker, d2Sticker, d3Sticker];
    for(let i=0; i < 3; i++) {
        if(stickersChosen[i] == "none") {
            stickers[i] = "-";
            stickers[i+3] = "-";
        } else if(stickersChosen[i] == "front") {
            stickers[i+3] = "-";
        } else if(stickersChosen[i] == "back") {
            stickers[i] = "-";
        } else {
            throw Error("invalid sticker choice");
        }
    }
    this.stickers = stickers;
    this.dimensions = 3;
    this.orientation = [0, 1, 2, 3, 4, 5];
}

/*
    Applies orientationB as a rotation to orientationA.

    Returns another orientation indicated by composing orB with orA

    We utilize Cayley's Theorem, in that all groups are subgroups of a
    permutation group. In this case, we are using the group of orientations
    of a cube as a subgroup of the permutations of the faces of the cube

    This means we can simply compose two "permutations" to get another
    "permutation" that we want, even though they represent orientations
    of the cube
*/
function rotateOrientation(orientationA, orientationB) {
    let newOrientation = Array.from(orientationA).map(
        (_, ind) => orientationA[orientationB[ind]]
    );
    return newOrientation;
}

/*
    A generator that creates each possible orientation of the cube
*/
function *orientations() {
    for(let i = 0; i < factorial(3); i++) {
        let dimChoices = Array.from(Array(3-1));
        let dimPerm = i;
        let possibleDims = Array.from(Array(3)).map((_, ind) => ind);
        for(let j = 0; j < 3-1; j++) {
            let dimIndex = dimPerm % (3-j);
            let chosenDim = possibleDims[dimIndex];
            possibleDims.splice(dimIndex, 1);
            dimChoices[j] = chosenDim;
            dimPerm = ~~(dimPerm/(3-j));
        }
        yield *faceChoices(dimChoices);
    }
}

/*
    A helper function to generate the faces selected from the given
    dimensions chosen
*/
function *faceChoices(dimChoices) {
    for(let i = 0; i < Math.pow(2, 3-1); i++) {
        let faceChoices = Array.from(Array(3-1));
        let swpChoice = i;
        for(let j = 0; j < 3-1; j++) {
            faceChoices[j] = swpChoice%2 == 1;
            swpChoice = ~~(swpChoice/2);
        }
        yield completeOrientation(dimChoices, faceChoices);
    }
}

/*
    Helper function to get the orientation from the given dimensions and
    choice of face for each dimension
*/
function completeOrientation(dimChoices, faceChoices) {
    let isChosen = Array(3).fill(false);
    dimChoices.forEach((v) => { isChosen[v] = true; });

    let missingDim = Array.from(Array(3)).map((_, ind) => ind)
        .filter((v) => !isChosen[v])[0];
    let orDims = Array.from(Array(3-1)).map((_, ind) => dimChoices[ind]);
    orDims.push(missingDim);

    let orFlips = faceChoices.map(v => +v).reduce((a, b) => a+b);
    orFlips += +!orientationEven(...orDims);

    let faceFlips = Array.from(faceChoices);
    faceFlips.push(orFlips%2 == 1);

    let orientation = Array.from(orDims).map((v, ind) => {
        return (v+3*(+faceFlips[ind]));
    });
    orientation = orientation.concat(orientation.map(v => (v+3)%6));

    return orientation;
}

function init() {
    console.log("cubepiece module loaded");
}
init();
