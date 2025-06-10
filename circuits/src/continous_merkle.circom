pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/mux2.circom";

template GetParentGeneralisedIndex() {
    signal input generalisedIdx;
    signal output parentIdx;
    
    parentIdx <-- generalisedIdx >> 1;
    signal doublePI <== parentIdx * 2;
    signal diff <== generalisedIdx - doublePI;
    diff * (diff - 1) === 0;
}

template IsOdd() {
    signal input in;
    signal output out;
    
    out <-- in & 1;
    out * (out - 1) === 0;
}

template IsEven() {
    signal input in;
    signal output out;
    
    component isOdd = IsOdd();
    isOdd.in <== in;
    
    out <== 1 - isOdd.out;
}

template Hash() {
    signal input left;
    signal input right;
    signal output hash;
    
    component mimc = MiMC7(91);
    mimc.x_in <== left;
    mimc.k <== right;
    hash <== mimc.out;
}

// Template to append siblings to the left and right of the array
// maxSize is always kept as maximum arrSize possible i.e 256 + 2 so 256
// thus this enforces that arrSize < maxSize
template AddSiblings(maxSize) {
    signal input arr[maxSize];
    signal input arrSize;
    signal input siblings[2];
    signal input condition[2];

    signal output newArr[maxSize];
    signal output newSize;

    component mux[maxSize - 1];
    // replacing the first element of the array with arr[0] if condition 1 is true
    component firstMux = Mux1();
    firstMux.c[0] <== arr[0];
    firstMux.c[1] <== siblings[0];
    firstMux.s <== condition[0];
    newArr[0] <== firstMux.out;

    component isEq[maxSize];
    signal appendSiblings[maxSize];
    signal arrSizeNotPrepended[maxSize];

    for (var i = 1; i < maxSize; i++) {

        // first we do some stuff for the append case
        // we need to append at arrSize if the condition 1 was false or at arrSize + 1 if it is true
        // thus one input to the isEq is `i` and another is `arrSize` or `arrSize + 1`.
        arrSizeNotPrepended[i] <== arrSize * (1 - condition[0]);
        isEq[i] = IsEqual();
        isEq[i].in[0] <== i;
        isEq[i].in[1] <== arrSizeNotPrepended[i] + (arrSize + 1)*condition[0];
        appendSiblings[i] <== isEq[i].out * siblings[1];

        mux[i - 1] = Mux2();
        // nothing happens 
        mux[i - 1].c[0] <== arr[i]; 
        // only conidtion one is true then `new_array[i]` is `arr[i-1]`
        mux[i - 1].c[1] <== arr[i-1];
        // if only condition two is true then `new_arr[i]` is `arr[i]` and if `new_arr[arrSize] = siblings[1]`
        mux[i - 1].c[2] <== arr[i] * (1 - isEq[i].out) + appendSiblings[i];
        // if both conditions is true then `new_arr[i]` is `arr[i- 1]` and if `new_arr[arrSize + 1] = siblings[1]`
        mux[i - 1].c[3] <== arr[i - 1] * (1 - isEq[i].out) + appendSiblings[i];

        mux[i - 1].s[0] <== condition[0];
        mux[i - 1].s[1] <== condition[1];

        newArr[i] <== mux[i - 1].out;
    }
    // the new size can be `arrSize` or `arrSize + 1` or `arrSize + 2`
    newSize <== arrSize + condition[0] + condition[1];
}

// Template for one layer of the Merkle tree computation
template MerkleLayer(maxSize, nBits) {
    signal input currentLayer[maxSize];
    signal input layerSize;
    signal input siblings[2];
    signal input firstIndex;
    signal input lastIndex;
    
    signal output aboveLayer[maxSize];
    signal output aboveLayerSize;
    signal output newFirstIndex;
    signal output newLastIndex;
    
    component firstIsOdd = IsOdd();
    firstIsOdd.in <== firstIndex;

    component lastIsEven = IsEven();
    lastIsEven.in <== lastIndex;
    
    component addSiblings = AddSiblings(maxSize);
    addSiblings.arr <== currentLayer;
    addSiblings.arrSize <== layerSize;
    addSiblings.siblings <== siblings;
    addSiblings.condition[0] <== firstIsOdd.out;
    addSiblings.condition[1] <== lastIsEven.out;

    
    signal pairCount;

    pairCount <-- addSiblings.newSize >> 1;
    signal check_pc <== pairCount * 2;

    signal remainderBit <== addSiblings.newSize - check_pc;
    remainderBit * (remainderBit - 1) === 0;
    
    component hashes[maxSize >> 1];

    for (var i = 0; i < maxSize; i += 2) {
        hashes[i >> 1] = Hash();
        hashes[i >> 1].left <== addSiblings.newArr[i];
        hashes[i >> 1].right <== addSiblings.newArr[i + 1];
        aboveLayer[i >> 1] <== hashes[i >> 1].hash;
    }
   
    
    aboveLayerSize <== pairCount;
    
    component newFirst = GetParentGeneralisedIndex();
    newFirst.generalisedIdx <== firstIndex - firstIsOdd.out;
    newFirstIndex <== newFirst.parentIdx;
    
    component newLast = GetParentGeneralisedIndex();
    newLast.generalisedIdx <== lastIndex + lastIsEven.out;
    newLastIndex <== newLast.parentIdx;
}

template GenerateRoot(maxSegmentSize, height, nBits) {
    signal input continousSegment[maxSegmentSize];
    signal input segmentSize;
    signal input auditPath[height][2];
    signal input firstGenIdx;
    signal input lastGenIdx;

    signal output root;
    
    signal currentLayer[height + 1][maxSegmentSize];
    signal layerSizes[height + 1];
    signal firstIndices[height + 1];
    signal lastIndices[height + 1];
    
    for (var i = 0; i < maxSegmentSize; i++) {
        currentLayer[height][i] <== continousSegment[i];
    }

    layerSizes[height] <== segmentSize;
    firstIndices[height] <== firstGenIdx;
    lastIndices[height] <== lastGenIdx;
    
    component layers[height + 1];

    for (var y = height; y > 0; y--) {
        layers[y] = MerkleLayer(maxSegmentSize, nBits);
        layers[y].currentLayer <== currentLayer[y];
        layers[y].layerSize <== layerSizes[y];
        layers[y].siblings <== auditPath[y - 1];
        layers[y].firstIndex <== firstIndices[y];
        layers[y].lastIndex <== lastIndices[y];
        
        currentLayer[y - 1] <== layers[y].aboveLayer;
        layerSizes[y - 1] <== layers[y].aboveLayerSize;
        firstIndices[y - 1] <== layers[y].newFirstIndex;
        lastIndices[y - 1] <== layers[y].newLastIndex;

    }
    
    root <== currentLayer[0][0];
}

component main = GenerateRoot(258, 11, 9);