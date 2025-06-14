import { buildPoseidon } from "circomlibjs";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import { bigIntToChunkedBytes, bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailContentVerifierCircuitInputs } from "../helpers/email_content_helper";
import { Proof, serializeG1Compressed, serializeG2Compressed, serializeProof, serializePublicSignal } from "../helpers/serilizer";

const path = require("path");
const fs = require("fs");
const wasm_tester = require("circom_tester").wasm;
const snarkjs = require("snarkjs");

describe("Email Content Verification Test", function () {
    jest.setTimeout(30 * 60 * 1000); // 30 minutes - circuit compilation can take time

    let testEmail: Buffer;
    let suiEmail: Buffer;
    let circuit: any;
    const suiAddress = "0xc98e7ba4363b25b7e5b992c03e6405d1b0bffde2fa37af634b6646766bd50e94";

    // Content snippets from the actual emails
    const testEmailContent = "This is a test email to see if you are working";

    beforeAll(async () => {
        testEmail = fs.readFileSync(
            path.join("./test/emls/test_2.eml"),
            "utf8"
        );

        circuit = await wasm_tester(path.join(__dirname, "../src/email_content.circom"), {
            recompile: false,
            output: path.join(__dirname, "../build/email_content"),
            include: [path.join(__dirname, "../node_modules"), path.join(__dirname, "../../../node_modules")],
        });

    });

    it("shoudl work with the new circuit", async () => {
        const inputs = await generateEmailContentVerifierCircuitInputs(
            testEmail,
            suiAddress,
            testEmailContent
        );
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            "/Users/utkarshdagoat/dev/sui_overflow_/sui_overflow/circuits/build/email_content/email_content_js/email_content.wasm",
            "/Users/utkarshdagoat/dev/sui_overflow_/sui_overflow/circuits/build/email_content/partial_zkeys/email_content.zkey",
        )
        snarkjs.compile()

        console.log("Inputs: ", publicSignals);
        console.log("Proof: ", proof);


    })

});

