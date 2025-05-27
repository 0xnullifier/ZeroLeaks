import { readFileSync, writeFileSync } from "fs";
import { generateEmailContentVerifierCircuitInputs } from "../helpers/email_content_helper.js";
import path from "path";

// CLI argument parsing
async function main() {
    const [, , pathToEmlFile, suiAddress, testEmailContent] = process.argv;

    if (!pathToEmlFile || !suiAddress || !testEmailContent) {
        console.error("Usage: ts-node generate_input.ts <pathToEmlFile> <suiAddress> <testEmailContent>");
        process.exit(1);
    }

    const testEmail = readFileSync(
        pathToEmlFile,
        "utf8"
    );
    const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
        testEmail,
        suiAddress,
        testEmailContent
    );

    const outputPath = path.join(__dirname, "input.json");
    writeFileSync(outputPath, JSON.stringify(emailContentInputs, null, 2), "utf8");
    console.log(`Input written to ${outputPath}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
