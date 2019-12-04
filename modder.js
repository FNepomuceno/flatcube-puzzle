function orientHandler(cube) {
    let displayedDim = +Array.from(document.getElementsByName("dimX"))
        .filter(elem => elem.checked)[0].value;
    let undisplayedDim = +Array.from(document.getElementsByName("dimY"))
        .filter(elem => elem.checked)[0].value;
    let orientDirection = +Array.from(document.getElementsByName("rotD"))
        .filter(elem => elem.checked)[0].value;
    console.log("Rotate", displayedDim, undisplayedDim, orientDirection);

    // generate rotation orientation
    let cycle = orientDirection == 0?
        [displayedDim, undisplayedDim]: [undisplayedDim, displayedDim];
    cycle = cycle.concat(cycle.map(v => (v+3)%6));

    let orientation = Array.from(Array(6)).map((_, ind) => ind);
    cycle.forEach((_, ind) => {
        orientation[cycle[(ind+1)%4]] = cycle[ind];
    });
    console.log(orientation);
  
    // then rotate cube
    cube.orientation = rotateOrientation(cube.orientation, orientation);

    // update visuals
    setDivCells(cube);
    setOptions(cube);
}

function setOptions(cube) {
    let orDimLabels = ["dim0Label", "dim1Label", "dim2Label"].map(str => {
        return document.getElementById(str);
    });
    orDimLabels.forEach((elem, ind) => {
        elem.innerHTML = cube.orientation[3-1-ind];
    });
}

function init() {
    console.log("cubemodder module loaded");
}
init();
