pragma circom 2.2.1;

include "../node_modules/circomlib/circuits/mimc.circom";
template Hash() {
    signal input left;
    signal input right;
    signal output hash;
    
    component mimc = MiMC7(91);
    mimc.x_in <== left;
    mimc.k <== right;
    hash <== mimc.out;
}

// ensure construction of a simple full merkle tree
template SimpleFullMerkleTree(
    height
){
    signal input leafNodes[1 << height];

    signal nodes[height + 1][1 << height];

    signal output root;
    
    for(var x = 0; x < 1 << height; x++){
        nodes[height][x] <== leafNodes[x];
    }

    component hashes[height + 1][1 << height];

    for(var i = height; i > 0; i--){
        for (var x = 0; x < 1 << i; x += 2){
            hashes[i][x] = Hash();
            hashes[i][x].left <== nodes[i][x];
            hashes[i][x].right <== nodes[i][x + 1];
            nodes[i - 1][x >> 1] <== hashes[i][x].hash;
        }
    }

    root <== nodes[0][0];
}

component main = SimpleFullMerkleTree(11);