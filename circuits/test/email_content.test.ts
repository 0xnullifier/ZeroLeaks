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
    const testEmailContent = `Effective Q2 2025, we are initiating a cost-optimization measure across all formulations of Immunorin 200mg. The active immunostimulant compound (Gamma-IFX) will be adjusted to a revised concentration of 140mg per capsule.`;

    beforeAll(async () => {
        testEmail = fs.readFileSync(
            path.join("./test/emls/sample_1.eml"),
            "utf8"
        );

        circuit = await wasm_tester(path.join(__dirname, "../src/email_content.circom"), {
            recompile: true,
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
        const w = await circuit.calculateWitness(inputs)
        await circuit.checkConstraints(w)
    })

});

