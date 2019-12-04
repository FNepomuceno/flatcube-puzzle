function orientationEven(...permutation) {
    let array = [...permutation];
    let length = array.length;
    let swaps = 0;
    for(let i = 0; i < length; i++) {
        if(array[i] < 0) { continue; }

        let index = array[i];
        array[i] = -1;
        while(array[index] >= 0) {
            let nextIndex = array[index];
            array[index] = -1;

            index = nextIndex;
            swaps++;
        }
    }
    return swaps % 2 == 0;
}

function factorial(num) {
    if(num == 1)
        { return 1; }
    return num * factorial(num-1);
}

function init() {
    console.log("rotateutil module loaded");
}
init();

