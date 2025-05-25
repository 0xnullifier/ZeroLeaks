/// serialize the proof at frontend for sending to the contract

const BN254_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const G1_SERIALIZED_SIZE = 32; // 32 bytes for x
const G2_SERIALIZED_SIZE = 64; // 64 bytes for Fq2 x

const Y_IS_NEGATIVE = 1 << 7;
const INFINTY_FLAG = 1 << 6;
import { F1Field } from "@zk-kit/utils";
import { Groth16Proof, PublicSignals } from "snarkjs";
const FIELD = new F1Field(BN254_MODULUS);

interface Fq2 {
    a0: bigint; // real part
    a1: bigint; // imaginary part
}

/// Take inverse of a point in Fq2
function fq2Inverse({ a0, a1 }: Fq2): { a0: bigint; a1: bigint } {
    // a point in Fq2 is represented as a = a0 + a1 * i, where i^2 = -1
    // 1 / (a0 + a1 * i) = (a0 - a1 * i) / (a0^2 + a1^2)
    const denominator = FIELD.add(FIELD.mul(a0, a0), FIELD.mul(a1, a1));
    const denominator_inv = FIELD.inv(denominator);
    const a0_inv = FIELD.mul(a0, denominator_inv);
    const a1_inv = FIELD.mul(FIELD.neg(a1), denominator_inv);
    return { a0: a0_inv, a1: a1_inv };
}

function fq2Mul({ a0, a1 }: Fq2, { a0: b0, a1: b1 }: Fq2): Fq2 {
    const t0 = FIELD.mul(a0, b0);
    const t1 = FIELD.mul(a1, b1);
    return {
        a0: FIELD.sub(t0, t1), // a0 * b0 - a1 * b1
        a1: FIELD.add(FIELD.mul(a0, b1), FIELD.mul(a1, b0)) // a0 * b1 + a1 * b0
    }
}


function fqLexographicallyLargest(y: Fq2): boolean {
    // taken from https://github.com/zkcrypto/bls12_381/blob/main/src/fp2.rs#L171
    return (
        y.a1 > FIELD.neg(y.a1) || (y.a1 === 0n && y.a0 > FIELD.neg(y.a0))
    )
}




function toAffineG2(
    x: Fq2,
    y: Fq2,
    z: Fq2
): { x: Fq2; y: Fq2 } {
    // the points are already normalized
    if (z.a0 === 1n && z.a1 === 0n) {
        return { x, y };
    }
    const z_inv = fq2Inverse(z);
    const z_inv_squared = fq2Mul(z_inv, z_inv);
    const z_inv_cubed = fq2Mul(z_inv_squared, z_inv);

    const x_affine = fq2Mul(x, z_inv_squared);
    const y_affine = fq2Mul(y, z_inv_cubed);
    return { x: x_affine, y: y_affine };
}


function toAffineG1(
    x: bigint,
    y: bigint,
    z: bigint
): { x: bigint; y: bigint } {
    // then points are already normalized
    if (z === 1n) {
        return { x, y };
    }
    const z_inv = FIELD.inv(z);
    const z_inv_squared = FIELD.mul(z_inv, z_inv);
    const z_inv_cubed = FIELD.mul(z_inv_squared, z_inv);

    const x_affine = FIELD.mul(x, z_inv_squared);
    const y_affine = FIELD.mul(y, z_inv_cubed);
    return { x: x_affine, y: y_affine };
}

// The cords are in projective form
export function serializeG1Compressed(cords: string[]): Uint8Array {
    if (cords.length !== 3) {
        throw new Error("The cords are not in projective form");
    }
    const x = BigInt(cords[0]);
    const y = BigInt(cords[1]);
    const z = BigInt(cords[2]);

    const isInfinity = x === 0n && y === 0n && z === 1n;

    if (isInfinity) {
        const compressedBytes = new Uint8Array(G1_SERIALIZED_SIZE);
        compressedBytes[G1_SERIALIZED_SIZE - 1] = compressedBytes[G1_SERIALIZED_SIZE - 1] | INFINTY_FLAG;
        return compressedBytes;
    }

    const { x: x_aff, y: y_aff } = toAffineG1(x, y, z);
    console.log(y_aff)

    const isPositive = y_aff <= FIELD.neg(y_aff);

    const x_bytes = new Uint8Array(G1_SERIALIZED_SIZE);
    x_bytes.set(toLittleEndian(x_aff), 0);

    if (!isPositive) {
        x_bytes[G1_SERIALIZED_SIZE - 1] = x_bytes[G1_SERIALIZED_SIZE - 1] | Y_IS_NEGATIVE;
    }

    return x_bytes;
}



export function serializeG2Compressed(cords: string[][]): Uint8Array {
    // check the length of cords
    if (cords.length !== 3) {
        throw new Error("The cords are not in projective form");
    }
    const length = (cords[0].length + cords[1].length + cords[2].length);
    if (length !== 6) {
        throw new Error("The cordinates are expected to be in Fq2 format");
    }

    const x = {
        a0: BigInt(cords[0][0]),
        a1: BigInt(cords[0][1])
    }
    const y = {
        a0: BigInt(cords[1][0]),
        a1: BigInt(cords[1][1])
    }
    const z = {
        a0: BigInt(cords[2][0]),
        a1: BigInt(cords[2][1])
    };

    const isInfinity = x.a0 === 0n && x.a1 === 0n && y.a0 === 0n && y.a1 === 0n && z.a0 === 1n && z.a1 === 0n;

    if (isInfinity) {
        const compressedBytes = new Uint8Array(G2_SERIALIZED_SIZE);
        compressedBytes[G2_SERIALIZED_SIZE - 1] = compressedBytes[G2_SERIALIZED_SIZE - 1] | INFINTY_FLAG;
        return compressedBytes;
    }

    const { x: x_aff, y: y_aff } = toAffineG2(x, y, z);

    const isLexographicallyLargest = fqLexographicallyLargest(y_aff);


    const x_bytes = new Uint8Array(G2_SERIALIZED_SIZE);
    const a0_bytes = toLittleEndian(x_aff.a0);
    const a1_bytes = toLittleEndian(x_aff.a1);

    x_bytes.set(a0_bytes, 0);
    x_bytes.set(a1_bytes, G1_SERIALIZED_SIZE);

    if (isLexographicallyLargest) {
        x_bytes[G2_SERIALIZED_SIZE - 1] = x_bytes[G2_SERIALIZED_SIZE - 1] | Y_IS_NEGATIVE;
    }

    return x_bytes;
}


const zero = 0n;
function toLittleEndian(bigNumber: bigint): Uint8Array {
    let result = new Uint8Array(32);
    let i = 0;
    while (bigNumber > zero) {
        result[i] = Number(bigNumber % 256n);
        bigNumber = bigNumber >> 8n;
        i += 1;
    }
    return result;
}

export interface Proof {
    pi_a: string[]; // G1 point in projective form
    pi_b: string[][]; // G2 point in projective form
    pi_c: string[]; // G1 point in projective form
}

/// takes the proof and returns the Uint8Array that can be sent to the contract
export function serializeProof(proof: Proof): Uint8Array {
    const buffer = new Uint8Array(G1_SERIALIZED_SIZE * 2 + G2_SERIALIZED_SIZE);
    buffer.set(serializeG1Compressed(proof.pi_a), 0);
    buffer.set(serializeG2Compressed(proof.pi_b), G1_SERIALIZED_SIZE);
    buffer.set(serializeG1Compressed(proof.pi_c), G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE);
    return buffer;
}

function bigintTou64Slices(bigInt: bigint): bigint[] {
    const slices: bigint[] = [];
    while (bigInt > 0n) {
        slices.push(bigInt & 0xFFFFFFFFFFFFFFFFn); // take the last 64 bits
        bigInt >>= 64n; // shift right by 64 bits
    }
    return slices;
}

const serailizeBigint = (bigInt: bigint): Uint8Array => {
    const slices = bigintTou64Slices(bigInt);
    if (slices.length !== 4) {
        slices.fill(0n, slices.length, 4); // pad with zeros if less than 4 slices
    }
    const result = new Uint8Array(slices.length * 8);
    slices.forEach((slice, index) => {
        result.set(toLittleEndian(slice).slice(0, 8), index * 8);
    })
    return result;
}

export function serializePublicSignal(publicSignals: PublicSignals): Uint8Array {
    const result = new Uint8Array(32 * publicSignals.length);
    publicSignals.forEach((signal, index) => {
        const bigIntSignal = BigInt(signal);
        result.set(serailizeBigint(bigIntSignal), index * 32);
    })
    return result;
}
