#!/bin/bash

source circuit.env

echo "**GENERATING INPUT**"
start=$(date +%s)
set -x
node generate_input.js
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"


echo "****GENERATING WITNESS FOR SAMPLE INPUT****"
start=$(date +%s)
set -x
node "$BUILD_DIR"/"$CIRCUIT_NAME"_js/generate_witness.js "$BUILD_DIR"/"$CIRCUIT_NAME"_js/"$CIRCUIT_NAME".wasm ../circuit/inputs/input.json "$BUILD_DIR"/witness.wtns
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo

echo "****GENERATING PROOF FOR SAMPLE INPUT****"
start=$(date +%s)
set -x
NODE_OPTIONS='--max-old-space-size=16830' ../node_modules/.bin/snarkjs groth16 prove "$BUILD_DIR"/"$CIRCUIT_NAME"/partial_zkeys/"$CIRCUIT_NAME".zkey "$BUILD_DIR"/witness.wtns "$BUILD_DIR"/proof.json "$BUILD_DIR"/public.json
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo
