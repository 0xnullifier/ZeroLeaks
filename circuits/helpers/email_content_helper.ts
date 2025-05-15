import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";

export type IEmailContentCircuitInputs = {
    emailHeader: string[];
    emailHeaderLength: string;
    pubkey: string[];
    signature: string[];
    emailBody: string[];
    emailBodyLength: string;
    bodyHashIndex: string;
    precomputedSHA: string[];
    content: string[];
    address: string;
    fromEmailIndex: string;
};

export async function generateEmailContentVerifierCircuitInputs(
    email: string | Buffer,
    suiAddress: string,
    contentToVerify: string
): Promise<IEmailContentCircuitInputs> {
    const emailVerifierInputs = await generateEmailVerifierInputs(email);

    // Ensure emailBody is not undefined
    if (!emailVerifierInputs.emailBody) {
        throw new Error("Email body is undefined");
    }

    const bodyArray = emailVerifierInputs.emailBody.map((c) => Number(c));
    const bodyBuffer = Buffer.from(bodyArray);

    // Convert content string to array of ASCII values
    const contentArray = Array.from(Buffer.from(contentToVerify)).map(byte => byte.toString());

    // Find the start index of the content in the email body
    const contentStartBuffer = Buffer.from(contentToVerify.substring(0, Math.min(20, contentToVerify.length)));
    const contentStartIndex = bodyBuffer.indexOf(contentStartBuffer);

    if (contentStartIndex === -1) {
        throw new Error(`Content not found in email body: "${contentToVerify}"`);
    }

    // Find the "From:" header in the email header
    const emailHeaderArray = emailVerifierInputs.emailHeader.map((c) => Number(c));
    const headerBuffer = Buffer.from(emailHeaderArray);
    const fromEmailIndex = headerBuffer.indexOf(Buffer.from('From:'));

    if (fromEmailIndex === -1) {
        throw new Error("From: header not found in email header");
    }

    return {
        emailHeader: emailVerifierInputs.emailHeader,
        emailHeaderLength: emailVerifierInputs.emailHeaderLength,
        pubkey: emailVerifierInputs.pubkey,
        signature: emailVerifierInputs.signature,
        emailBody: emailVerifierInputs.emailBody,
        emailBodyLength: emailVerifierInputs.emailBodyLength!,
        bodyHashIndex: emailVerifierInputs.bodyHashIndex!,
        precomputedSHA: emailVerifierInputs.precomputedSHA!,
        content: contentArray,
        address: bytesToBigInt(fromHex(suiAddress)).toString(),
        fromEmailIndex: fromEmailIndex.toString(),
    };
}
