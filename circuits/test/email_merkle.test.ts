import { newMemEmptyTrie } from "circomlibjs";
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

    });

    it("should verify test.eml content", async function () {
        const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
            testEmail,
            suiAddress,
            testEmailContent
        );
        const bodyArr = emailContentInputs.emailBody.map((value: string) => Number(value));
        const bodyBuffer = Buffer.from(bodyArr);

        const contentArray = Array.from(Buffer.from(testEmailContent)).map(byte => byte.toString());

        const contentStartBuffer = Buffer.from(testEmailContent.substring(0, Math.min(testEmailContent.length, 20)));
        const contentStartIndex = bodyBuffer.indexOf(contentStartBuffer);

        const tree = await newMemEmptyTrie()
        console.time("insertEmailContent");
        emailContentInputs.emailBody.forEach(async (value, index) => {
            await tree.insert(index, value)
        })
        const auditPaths = []
        for (let i = contentStartIndex; i < contentStartIndex + contentArray.length; i++) {
            console.log(i)
            const res = await tree.find(i);
            // console.log(res)
            auditPaths.push(res)
        }
        // console.log(auditPaths)
        console.timeEnd("insertEmailContent");
    });

});

