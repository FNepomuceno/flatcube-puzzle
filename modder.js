const Modder = function Modder() {
    function setDimensions() {
        let numDims = this.cube.dimensions.length;
        let dimensions = this.cube.orientation.slice(0, numDims);
        let chosenDimensions = dimensions.slice(0, 2);
        let unchosenDimensions = dimensions.slice(2);

        return { chosenDimensions, unchosenDimensions };
    }

    function calcDimRotation(dimA, dimB, direction) {
        return direction == 0? [dimA, dimB]: [dimB, dimA];
    }

    function updateVisuals() {
        for({ view } of this.views) {
            view.setCells();
        }
        setOptions.apply(this);
    }

    function orientHandler() {
        let displayedDim = +this.inputs.chosenInputs.filter(elem =>
            elem.checked)[0].value;
        let undisplayedDim = +this.inputs.unchosenInputs.filter(elem =>
            elem.checked)[0].value;
        let orientDirection = +this.inputs.orDirInputs.filter(elem =>
            elem.checked)[0].value;
        let numDims = this.cube.dimensions.length;

        // get rotation orientation
        let dimRotation = calcDimRotation(displayedDim, undisplayedDim,
            orientDirection);
        let orientation = Util.axisRotation(numDims, ...dimRotation);

        // rotate cube
        this.cube.orientation = Orientation.compose(
            this.cube.orientation, orientation);

        // update visuals
        updateVisuals.apply(this);
    }

    function sideOrientation(numDims, sidePicked) {
        // convert to chosen/unchosen in other handler
        let dimA = numDims-2+(sidePicked % 2), dimB = 0;
        let direction = +(sidePicked >= 2);
        
        // generate cycle and orientation
        let dimRotation = calcDimRotation(dimA, dimB, direction);
        let orientation = Util.axisRotation(numDims, ...dimRotation);

        return orientation;
    }

    function twistHandler() {
        let numDims = this.cube.dimensions.length;
        let sidePicked = +this.inputs.sideInputs.filter(elem =>
            elem.checked)[0].value;
        let twistDirection = +this.inputs.twDirInputs.filter(elem =>
            elem.checked)[0].value;
        let twistSide = (4+sidePicked+Math.pow(-1, twistDirection+1)) % 4;

        let dstOrientation = sideOrientation(numDims, sidePicked);
        let twsOrientation = sideOrientation(numDims, twistSide);
        let srcOrientation = Orientation.compose(twsOrientation,
            dstOrientation);

        // get indices of pieces to rotate
        let dstIndices = new Square.SquareView(this.cube,
            dstOrientation).indices;
        let srcIndices = new Square.SquareView(this.cube,
            srcOrientation).indices;

        // get pieces of cube
        let pieces = srcIndices.map(v => this.cube.pieces[v]);

        // make the twist
        pieces.forEach((p, i) => {
            let twist = Orientation.conjugate(this.cube.orientation,
                twsOrientation);

            p.orientation = Orientation.compose(p.orientation, twist);
            this.cube.pieces[dstIndices[i]] = p;
        });

        // update visuals
        updateVisuals.apply(this);
    }

    function addView(view, tag) {
        this.views.push({ view, tag });
    }

    function GameController(cube, canvasId, tag) {
        this.cube = cube;
        this.canvas = document.getElementById(canvasId);
        this.tag = tag;
        this.views = []; // Views to update when changes made
        this.addView = addView;
        let {
            chosenDimensions, unchosenDimensions
        } = setDimensions.apply(this);
        this.chosenDimensions = chosenDimensions;
        this.unchosenDimensions = unchosenDimensions;
        let { inputs, buttons } = generateOptions.apply(this);
        this.inputs = inputs;
        this.buttons = buttons;
        setOptions.apply(this);

        this.buttons.rotButton.addEventListener("click", () =>
            orientHandler.apply(this));
        this.buttons.twsButton.addEventListener("click", () =>
            twistHandler.apply(this));
    }

    function setOptions() {
        let numDims = this.cube.dimensions.length;
        const directionLabels = ["Forward", "Backward"];
        const sideLabels = ["Top", "Left", "Bottom", "Right"];
        const chosenLabels = ["(left/right)", "(top/bottom)"];

        // Orient Section
        this.inputs.chosenInputs.forEach((v, i) => {
            let inpLabel = v.nextSibling;
            inpLabel.innerHTML = 
                `${this.cube.orientation[numDims-1-i]} ${chosenLabels[i]}`;
        });

        this.inputs.unchosenInputs.forEach((v, i) => {
            let inpLabel = v.nextSibling;
            inpLabel.innerHTML = this.cube.orientation[numDims-1-(i+2)];
        });

        this.inputs.orDirInputs.forEach((v, i) => {
            let inpLabel = v.nextSibling;
            // Doesn't change, but might as well keep it here for now
            inpLabel.innerHTML = directionLabels[i];
        });

        // Twist Section
        this.inputs.sideInputs.forEach((v, i) => {
            let inpLabel = v.nextSibling;
            inpLabel.innerHTML = sideLabels[i];
        });

        this.inputs.twDirInputs.forEach((v, i) => {
            let inpLabel = v.nextSibling;
            // Doesn't change, but might as well keep it here for now
            inpLabel.innerHTML = directionLabels[i];
        });

        // Options for layers for each dimension above 3 would go here
    }

    function generateOptions() {
        let numDims = this.cube.dimensions.length;

        // Orient Section
        let orSection = document.createElement("div");
        orSection.className = "orSection";
        this.canvas.appendChild(orSection);

        let orSecHeader = document.createElement("h3");
        orSecHeader.innerHTML = "Re-orient Cube";
        orSection.appendChild(orSecHeader);

        let dispHeader = document.createElement("h4");
        dispHeader.innerHTML = "Displayed Dimensions";
        orSection.appendChild(dispHeader);

        let dimxRadios = [];
        for(let i = 0; i < 2; i++) {
            let newInput = document.createElement("input");
            newInput.type = "radio";
            newInput.name = "dimX";
            newInput.value = numDims-1-i;
            newInput.id = `${this.tag}-dim-${i}`;
            if(i === 0) { newInput.checked = true; }
            orSection.appendChild(newInput);
            dimxRadios.push(newInput);

            let newLabel = document.createElement("label");
            newLabel.htmlFor = newInput.id;
            orSection.appendChild(newLabel);
        }

        let undispHeader = document.createElement("h4");
        undispHeader.innerHTML = "Unisplayed Dimensions";
        orSection.appendChild(undispHeader);

        let dimyRadios = [];
        for(let i = 2; i < numDims; i++) {
            let newInput = document.createElement("input");
            newInput.type = "radio";
            newInput.name = "dimY";
            newInput.value = numDims-1-i;
            newInput.id = `${this.tag}-dim-${i}`;
            if(i === 2) { newInput.checked = true; }
            orSection.appendChild(newInput);
            dimyRadios.push(newInput);

            let newLabel = document.createElement("label");
            newLabel.htmlFor = newInput.id;
            orSection.appendChild(newLabel);
        }

        let rotHeader = document.createElement("h4");
        rotHeader.innerHTML = "Rotation Direction";
        orSection.appendChild(rotHeader);

        let rotRadios = [];
        for(let i = 0; i < 2; i++) {
            let newInput = document.createElement("input");
            newInput.type = "radio";
            newInput.name = "rotD";
            newInput.value = i;
            newInput.id = `${this.tag}-dirRot-${i}`;
            if(i === 0) { newInput.checked = true; }
            orSection.appendChild(newInput);
            rotRadios.push(newInput);

            let newLabel = document.createElement("label");
            newLabel.htmlFor = newInput.id;
            orSection.appendChild(newLabel);
        }

        orSection.appendChild(document.createElement("br"));

        let rotButton = document.createElement("button");
        rotButton.type = "button";
        rotButton.id = `${this.tag}-rotButton`;
        rotButton.innerHTML = "Rotate";
        rotButton.style.marginTop = "1em";
        orSection.appendChild(rotButton);

        // Twist Section
        let twSection = document.createElement("div");
        twSection.className = "twSection";
        this.canvas.appendChild(twSection);

        let twSecHeader = document.createElement("h3");
        twSecHeader.innerHTML = "Twist Cube";
        twSection.appendChild(twSecHeader);

        let sideHeader = document.createElement("h4");
        sideHeader.innerHTML = "Select Side";
        twSection.appendChild(sideHeader);

        let sideRadios = [];
        for(let i = 0; i < 4; i++) {
            let newInput = document.createElement("input");
            newInput.type = "radio";
            newInput.name = "twsS";
            newInput.value = i;
            newInput.id = `${this.tag}-sideTws-${i}`;
            if(i === 0) { newInput.checked = true; }
            twSection.appendChild(newInput);
            sideRadios.push(newInput);

            let newLabel = document.createElement("label");
            newLabel.htmlFor = newInput.id;
            twSection.appendChild(newLabel);
        }

        let twsHeader = document.createElement("h4");
        twsHeader.innerHTML = "Twist Direction";
        twSection.appendChild(twsHeader);

        let twRadios = [];
        for(let i = 0; i < 2; i++) {
            let newInput = document.createElement("input");
            newInput.type = "radio";
            newInput.name = "twsD";
            newInput.value = i;
            newInput.id = `${this.tag}-dirTws-${i}`;
            if(i === 0) { newInput.checked = true; }
            twSection.appendChild(newInput);
            twRadios.push(newInput);

            let newLabel = document.createElement("label");
            newLabel.htmlFor = newInput.id;
            twSection.appendChild(newLabel);
        }

        // Options for layers for each dimension above 3 would go here

        twSection.appendChild(document.createElement("br"));

        let twsButton = document.createElement("button");
        twsButton.type = "button";
        twsButton.id = `${this.tag}-twsButton`;
        twsButton.innerHTML = "Twist";
        twsButton.style.marginTop = "1em";
        twSection.appendChild(twsButton);

        return {
            inputs: {
                chosenInputs: dimxRadios,
                unchosenInputs: dimyRadios,
                orDirInputs: rotRadios,
                sideInputs: sideRadios,
                twDirInputs: twRadios,
            },
            buttons: {
                rotButton,
                twsButton,
            }
        };
    }

    return {
        GameController
    };
}();
