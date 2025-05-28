import { buildMimc7, newMemEmptyTrie } from "circomlibjs";
import { generateEmailContentVerifierCircuitInputs } from "../helpers/email_content_helper";
import { MerkleTree } from "../helpers/merkle-multiproofs";
import { bytesToBigInt, toCircomBigIntBytes } from "@zk-email/helpers";

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


    // it("should verify test.eml content", async function () {
    //     const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
    //         testEmail,
    //         suiAddress,
    //         testEmailContent
    //     );
    //     const bodyArr = emailContentInputs.emailBody.map((value: string) => Number(value));
    //     const bodyBuffer = Buffer.from(bodyArr);

    //     const contentArray = Array.from(Buffer.from(testEmailContent)).map(byte => byte.toString());

    //     const contentStartBuffer = Buffer.from(testEmailContent.substring(0, Math.min(testEmailContent.length, 20)));
    //     const contentStartIndex = bodyBuffer.indexOf(contentStartBuffer);

    //     const tree = await newMemEmptyTrie()
    //     console.time("insertEmailContent");
    //     for (let i = 0; i < bodyArr.length; i++) {
    //         await tree.insert(i, bodyArr[i]);
    //     }
    //     const auditPaths = []
    //     for (let i = contentStartIndex; i < contentStartIndex + testEmailContent.length; i++) {
    //         const res = await tree.find(i);
    //         console.log(res.siblings.length)
    //         expect(res.found).toBe(true);
    //         auditPaths.push(res)
    //     }
    //     // console.log(auditPaths)
    //     console.timeEnd("insertEmailContent");
    // });

    it('should generate a correct Merkle tree for email content', async () => {
        const entries = [1, 2, 3, 4, 5, 6, 7, 8];
        const tree = await MerkleTree.buildTree(entries);
        console.log(tree.nodeMap);
        const auditPath = tree.getMultiProof([0, 1])
        console.log(auditPath);
    })

});

