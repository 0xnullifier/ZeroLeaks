#!/bin/bash
source circuit.env

R1CS_FILE="../build/email_content/email_content.r1cs"
PARTIAL_ZKEYS="$BUILD_DIR"/partial_zkeys
PHASE1=../keys/powersOfTau28_hez_final_23.ptau
source entropy.env

if [ ! -d "$BUILD_DIR"/partial_zkeys ]; then
    echo "No partial_zkeys directory found. Creating partial_zkeys directory..."
    mkdir -p "$BUILD_DIR"/partial_zkeys
fi

echo "****GENERATING ZKEY NONCHUNKED 0****"
start=$(date +%s)
set -x
NODE_OPTIONS='--max-old-space-size=16384' node ../node_modules/.bin/snarkjs groth16 setup "$R1CS_FILE" "$PHASE1" "$PARTIAL_ZKEYS"/"$CIRCUIT_NAME".zkey 
{ set +x; } 2>/dev/null
end=$(date +%s)
echo "DONE ($((end - start))s)"
echo
