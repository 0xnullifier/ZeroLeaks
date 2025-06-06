#!/bin/bash

source circuit.env
R1CS_FILE="$BUILD_DIR/$CIRCUIT_NAME.r1cs"
PHASE1=../circuit/powersOfTau28_hez_final_22.ptau

echo "****EXPORTING VKEY****"
start=$(date +%s)
set -x
NODE_OPTIONS='--max-old-space-size=16834' ../node_modules/.bin/snarkjs zkey export verificationkey ../build/email_content/partial_zkeys/email_content.zkey "$BUILD_DIR"/vkey.json

end=$(date +%s)
{ set +x; } 2>/dev/null
echo "DONE ($((end - start))s)"
echo