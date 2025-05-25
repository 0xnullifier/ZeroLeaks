import { buildPoseidon } from "circomlibjs";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import { bigIntToChunkedBytes, bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailContentVerifierCircuitInputs } from "../helpers/email_content_helper";
import { groth16, Groth16Proof } from "snarkjs"
import { Proof, serializeG1Compressed, serializeG2Compressed, serializeProof, serializePublicSignal } from "../helpers/serilizer";

const path = require("path");
const fs = require("fs");
const wasm_tester = require("circom_tester").wasm;



describe("Email Content Verification Test", function () {
    jest.setTimeout(30 * 60 * 1000); // 30 minutes - circuit compilation can take time

    let testEmail: Buffer;
    let suiEmail: Buffer;
    let circuit: any;
    const suiAddress = "0xc98e7ba4363b25b7e5b992c03e6405d1b0bffde2fa37af634b6646766bd50e94";

    // Content snippets from the actual emails
    const testEmailContent = "Material Substitution: The existing flame-retardant will be replaced with teflon";

    beforeAll(async () => {
        testEmail = fs.readFileSync(
            path.join(__dirname, "./emls/test.eml"),
            "utf8"
        );

    });

    it("should serialize correctly", async function () {
        const cords = [
            "20491192805390485299153009773594534940189261866228447918068658471970481763042",
            "9383485363053290200918347156157836566562967994039712273449902621266178545958",
            "1"
        ]
        const serialized = serializeG1Compressed(cords);
        const expected = [226, 242, 109, 190, 162, 153, 245, 34, 59, 100, 108, 177, 251, 51, 234, 219, 5, 157, 148, 7, 85, 157, 116, 65, 223, 217, 2, 227, 167, 154, 77, 45];
        expect(serialized).toEqual(new Uint8Array(expected));


        const g2Cords1 = [
            [
                "6375614351688725206403948262868962793625744043794305715222011528459656738731",
                "4252822878758300859123897981450591353533073413197771768651442665752259397132"
            ],
            [
                "10505242626370262277552901082094356697409835680220590971873171140371331206856",
                "21847035105528745403288232691147584728191162732299865338377159692350059136679"
            ],
            [
                "1",
                "0"
            ]
        ]
        const g2Cords2 = [
            [
                "10857046999023057135944570762232829481370756359578518086990519993285655852781",
                "11559732032986387107991004021392285783925812861821192530917403151452391805634"
            ],
            [
                "8495653923123431417604973247489272438418190587263600148770280649306958101930",
                "4082367875863433681332203403145435568316851327593401208105741076214120093531"
            ],
            [
                "1",
                "0"
            ]
        ]
        const searializedG21 = serializeG2Compressed(g2Cords1);
        const searializedG22 = serializeG2Compressed(g2Cords2);
        const expectedG21 = [171, 183, 61, 193, 127, 188, 19, 2, 30, 36, 113, 224, 192, 139, 214, 125, 132, 1, 245, 43, 115, 214, 208, 116, 131, 121, 76, 173, 71, 120, 24, 14, 12, 6, 243, 59, 188, 76, 121, 169, 202, 222, 242, 83, 166, 128, 132, 211, 130, 241, 119, 136, 248, 133, 201, 175, 209, 118, 247, 203, 47, 3, 103, 137]
        expect(searializedG21).toEqual(new Uint8Array(expectedG21));

        const expectedG212 = [237, 246, 146, 217, 92, 189, 222, 70, 221, 218, 94, 247, 212, 34, 67, 103, 121, 68, 92, 94, 102, 0, 106, 66, 118, 30, 31, 18, 239, 222, 0, 24, 194, 18, 243, 174, 183, 133, 228, 151, 18, 231, 169, 53, 51, 73, 170, 241, 37, 93, 251, 49, 183, 191, 96, 114, 58, 72, 13, 146, 147, 147, 142, 25]
        expect(searializedG22).toEqual(new Uint8Array(expectedG212));

        const test3 = [
            [
                "10857046999023057135944570762232829481370756359578518086990519993285655852781",
                "11559732032986387107991004021392285783925812861821192530917403151452391805634"
            ],
            [
                "8495653923123431417604973247489272438418190587263600148770280649306958101930",
                "4082367875863433681332203403145435568316851327593401208105741076214120093531"
            ],
            [
                "1",
                "0"
            ]
        ]
        const serializedTest3 = serializeG2Compressed(test3);
        const expectedTest3 = [237, 246, 146, 217, 92, 189, 222, 70, 221, 218, 94, 247, 212, 34, 67, 103, 121, 68, 92, 94, 102, 0, 106, 66, 118, 30, 31, 18, 239, 222, 0, 24, 194, 18, 243, 174, 183, 133, 228, 151, 18, 231, 169, 53, 51, 73, 170, 241, 37, 93, 251, 49, 183, 191, 96, 114, 58, 72, 13, 146, 147, 147, 142, 25]
        expect(serializedTest3).toEqual(new Uint8Array(expectedTest3));

        const proofJson = {
            "pi_a": [
                "1993149399503071165127042249865971894009518765996454382577187946169724931181",
                "16115845423197352210689064071785419990536828235761183472678894199351550924423",
                "1"
            ],
            "pi_b": [
                [
                    "14908809429488001272919426491864378481989520278913397484276604189490521649772",
                    "2374683501262664400166346635754737977249277501126372664503631716620459175299"
                ],
                [
                    "17848970083582180849121774859932367669901281096235527058096800236707766856443",
                    "19895578914493091871337506460093179717785926675661374783941332272872108540902"
                ],
                [
                    "1",
                    "0"
                ]
            ],
            "pi_c": [
                "8017079961781843322781595936860641289411563367052828840538385734639447522029",
                "12985092252525650653621181288539453602566454308986956569861934079755923773488",
                "1"
            ]
        }
        const serializedProof = serializeProof(proofJson);
        const hexString = Buffer.from(serializedProof).toString('hex');
        console.log(hexString);
    })

    it("should verify test.eml content", async function () {

        console.log(bytesToBigInt(fromHex(suiAddress)).toString())
        const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
            testEmail,
            suiAddress,
            testEmailContent
        );

        const start = Date.now();
        const { proof, publicSignals } = await groth16.fullProve(
            emailContentInputs,
            "/Users/utkarshdagoat/dev/sui_overflow/circuits/build/email_content_js/email_content.wasm",
            "/Users/utkarshdagoat/dev/sui_overflow/circuits/keys/circuit_v1_3.zkey"
        );
        const vKey = JSON.parse(fs.readFileSync("/Users/utkarshdagoat/dev/sui_overflow/circuits/keys/verification_key.json"));

        const res = await groth16.verify(vKey, publicSignals, proof);
        expect(res).toBe(true);


        const proofString = serializeProof(proof as Proof);
        const publicSignalsString = serializePublicSignal(publicSignals);
        const end = Date.now();
        console.log(`Proof generated in ${(end - start) / 1000}s`);

        const proofStringHex = Buffer.from(proofString).toString('hex');
        const publicSignalsStringHex = Buffer.from(publicSignalsString).toString('hex');

        console.log(`Proof: ${proofStringHex}`);
        console.log(`Public Signals: ${publicSignalsStringHex}`);

    });

});

