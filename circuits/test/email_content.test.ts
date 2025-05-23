import { buildPoseidon } from "circomlibjs";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import { bigIntToChunkedBytes, bytesToBigInt } from "@zk-email/helpers/dist/binary-format";
import { generateEmailContentVerifierCircuitInputs } from "../helpers/email_content_helper";

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


        const start = Date.now();
        circuit = await wasm_tester(path.join(__dirname, "../src/email_content.circom"), {
            recompile: true,
            output: path.join(__dirname, "../build/email_content"),
            include: [path.join(__dirname, "../node_modules"), path.join(__dirname, "../../../node_modules")],
        });
        const end = Date.now();
        console.log(`Circuit compiled in ${(end - start) / 1000}s`);
    });

    it("should verify test.eml content", async function () {
        const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
            testEmail,
            suiAddress,
            testEmailContent
        );

        const witness = await circuit.calculateWitness(emailContentInputs);
        await circuit.checkConstraints(witness);

    });

});

