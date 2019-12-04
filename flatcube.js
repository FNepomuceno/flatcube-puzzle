function orientationTest(cube) {
    let ors = [];
    for(o of orientations()) {
        ors.push(o);
    }
    ors.sort();
    for(o of ors) {
        cube.orientation = o;
        console.log(o);
        console.log(squareSlice(cube));
    }
}

function init() {
    console.log("flatcube module loaded");

    let cube = new CubePuzzle();
    console.log(cube);
    console.log(faceStickers(squareSlice(cube, [2, 0, 1, 5, 3, 4])));

    setDivCells(cube);
    setOptions(cube);

    document.getElementById("rotB")
        .addEventListener('click', () => orientHandler(cube));
}
init();
