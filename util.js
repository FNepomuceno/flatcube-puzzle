const Util = function Util() {
    /*
        Calculates the factorial of a positive integer
    */
    function factorial(num) {
        let product = 1;
        while(num > 1) {
            product *= num;
            num--;
        }
        return product;
    }

    /*
        Applies orientationB as a rotation to orientationA.

        Returns another orientation indicated by composing orB with orA

        We utilize Cayley's Theorem, in that all groups are subgroups of
        a permutation group. In this case, we are using the group of
        orientations of a cube as a subgroup of the permutations of the
        faces of the cube

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
        Characterizes each face by the dimensions it uses and by which
        part of the cube the face is at

        For an N dimensional cube, a face takes up N-1 dimensions, leaving
        a difference of 1, which is the dimension that face does not
        extend into. The number characterized by this face is not that
        number (which we will call `d` here), but N-1-d.

        Additionally, a subset of N faces of the N dimensional cube (it
        has 2N faces total) that do not contain opposing sides are
        considered to be part of one "side" of the cube with the remaining
        faces considered to be part of the other "side". The sides chosen
        reflect this notion of "side" and simply helps to distinguish
        which of two faces to choose given that there are always two
        faces sharing the same N-1 dimensions used

        This is a helper function for the completeOrientation() function
        This is also a helper function for the profileDims() function
    */
    function characterizeFaces(facesChosen, numDims) {
        let numFaces = facesChosen.length;
        let dimsChosen = Array.from(Array(numFaces));
        let sidesChosen = Array.from(Array(numFaces));

        dimsChosen.forEach((_, i) => {
            dimsChosen[i] = facesChosen[i] % numDims;
        });
        sidesChosen.forEach((_, i) => {
            sidesChosen[i] = +(facesChosen[i] >= numDims);
        });

        return { dimsChosen, sidesChosen };
    }

    /*
        Given a set of dimensions, adds the last dimension not used to
        the array. This function returns a new array instead of modifying
        the given one

        This is a helper function for the completeOrientation() function
    */
    function completeDimensions(dimsChosen, numDims) {
        let numDimsChosen = dimsChosen.length;
        let isChosen = Array(numDims).fill(false);
        let missingDims = Array.from(Array(numDims)).map((_, i) => i);
        let completeDims = Array.from(Array(numDims));

        dimsChosen.forEach(v => isChosen[v] = true);
        missingDims = missingDims.filter(v => !isChosen[v]);
        completeDims.forEach((_, i) => {
            if(i < numDimsChosen) { completeDims[i] = dimsChosen[i]; }
            else { completeDims[i] = missingDims[i-numDimsChosen]; }
        });

        return completeDims;
    }

    /*
        Determines if the given permutation is even.

        A permutation is even if the number of swaps required to restore
        to the 'identity' permutation is even, and likewise with odd
        permutations. We calculate the minimum number of swaps required,
        but an even permutation cannot be made into the identity
        permutation in an odd number of swaps and vice versa.

        This is a helper function for completeSideChoices()
    */
    function orientationIsEven(...permutation) {
        let permArray = Array.from(permutation);
        let length = permutation.length;
        let swaps = 0;
        for(let i=0; i < length; i++) {
            if(permArray[i] < 0) { continue; }

            let curIndex = permArray[i];
            permArray[i] = -1;
            while(permArray[curIndex] >= 0) {
                let nextIndex = permArray[curIndex];
                permArray[curIndex] = -1;
                curIndex = nextIndex;
                swaps++;
            }
        }
        return swaps%2 == 0;
    }

    /*
        Given a set of sides chosen and the complete array of dimensions
        to be used, this function creates an array of all the sides chosen
        in each dimension used. This function returns a new array instead
        of modifying the given `sidesChosen` array

        To make sure the orientation is valid, we need to make sure the
        overall permutation is even. To do this, we need to know how many
        side flips are made, and the orientation of the dimensions chosen

        This is a helper function for the completeOrientation() function
    */
    function completeSideChoices(sidesChosen, completeDims, numDims) {
        let completeSides = Array(numDims).fill(0);
        let numFlips = sidesChosen.reduce((a, b) => a+b);

        numFlips += +!orientationIsEven(...completeDims);
        sidesChosen.forEach((v, i) => completeSides[i]=v);
        completeSides[numDims-1] = numFlips % 2;

        return completeSides;
    }

    /*
        Given a choice for the faces chosen, constructs the rest of the
        orientation

        For a cube of N dimensions, this input is an array of N-1 integers
        from 0 to 2N-1 where no two elements in the array are N apart.
        These criteria are enough to uniquely determine the orientation
        requested
    */
    function completeOrientation(facesChosen) {
        let numDims = facesChosen.length + 1;
        let {
            dimsChosen, sidesChosen
        } = characterizeFaces(facesChosen, numDims);
        let completeDims = completeDimensions(dimsChosen, numDims);
        let completeSides = completeSideChoices(
            sidesChosen, completeDims, numDims);

        let orientation = Array.from(completeDims).map((v, i) => {
            return v + numDims*completeSides[i];
        });
        orientation = orientation.concat(orientation.map(v => {
            return (v+numDims) % (2*numDims);
        }));

        return orientation;
    }

    function * orientationHelper(numDims, currentLength, faceChoices,
            facesChosen, completeOr=false) {
        if(currentLength == numDims-1) {
            if(completeOr) {
                yield completeOrientation(facesChosen);
            } else {
                yield facesChosen;
            }
            return;
        }
        for(d of faceChoices) {
            let newFaces = Array.from(facesChosen);
            let newChoices = faceChoices.filter(v => {
                return v%numDims != d%numDims;
            });
            newFaces.push(d);
            yield * orientationHelper(numDims, currentLength+1,
                newChoices, newFaces, completeOr);
        }
    }

    /*
        Generates all possible orientations of a cube of a given number
        of dimensions.

        Orientations provided can be the minimal type, where the entries
        are the only ones required to determine a unique orientation, or
        the complete type, which gives the complete permutation of the
        faces
    */
    function * generateOrientations(numDims, completeOr=false) {
        let faceChoices = Array.from(Array(2*numDims)).map((_, i) => i);
        yield * orientationHelper(numDims, 0, faceChoices, [],
            completeOr);
    }

    /*
        Calculates the offset for piece indices in a cube with the given
        dimensions with respect to the dimensions chosen
    */
    function calcDimOffsets(cubeDimensions, dimsChosen) {
        let numDims = cubeDimensions.length;
        let product = 1;
        let baseOffsets = Array.from(Array(numDims));
        let offsets = Array.from(Array(numDims));

        cubeDimensions.forEach((v, i) => {
            baseOffsets[i] = product;
            product *= v;
        });
        offsets = offsets.map((_, i) => {
            return baseOffsets[numDims-1-dimsChosen[numDims-1-i]];
        });

        return offsets;
    }

    // helper function
    function calcDimSizes(cubeDimensions, dimsChosen) {
        let numDims = cubeDimensions.length;
        let dimSizes = Array.from(Array(numDims));

        dimSizes.forEach((_, i) => {
            dimSizes[i] = cubeDimensions[numDims-1-dimsChosen[i]];
        });

        return dimSizes;
    }

    function profileDims(cube, orientation) {
        let numDims = cube.dimensions.length;
        let {
            dimsChosen, sidesChosen
        } = characterizeFaces(orientation.slice(0, numDims), numDims);

        let offsets = calcDimOffsets(cube.dimensions, dimsChosen);
        let dimSides = Array.from(sidesChosen).reverse();
        let dimSizes = calcDimSizes(cube.dimensions, dimsChosen);

        return { numDims, offsets, dimSides, dimSizes };
    }

    console.log('Util Module loaded');
    return {
        factorial,
        rotateOrientation,
        completeOrientation,
        generateOrientations,
        profileDims
    };
}();

