import { bytesToBigInt, fromHex } from "@zk-email/helpers";
import { generateEmailVerifierInputs } from "@zk-email/helpers";
import { generalisedIndex, MerkleTree } from "./merkleTree";

export const MAX_BODY_LENGTH = 2048;
export const MAX_CONTENT_LENGTH = 258;

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
    bodyMerkleRoot: string;
    auditPath: string[][];
    firstGenIdx: string;
    lastGenIdx: string;
    contentLength: string;
};

export async function generateEmailContentVerifierCircuitInputs(
    email: string | Buffer,
    suiAddress: string,
    contentToVerify: string
): Promise<IEmailContentCircuitInputs> {
    const emailVerifierInputs = await generateEmailVerifierInputs(email);

    console.log(Buffer.from(Uint8Array.from(emailVerifierInputs.emailHeader)).toString())

    if (!emailVerifierInputs.emailBody) {
        throw new Error("Email body is undefined");
    }

    const bodyArray = emailVerifierInputs.emailBody.map((c) => Number(c));

    emailVerifierInputs.emailBody = bodyArray.map((c) => c.toString());


    const bodyBuffer = Buffer.from(bodyArray);


    const contentArray = Array.from(Buffer.from(contentToVerify)).map(byte => byte.toString());
    const contentLength = contentArray.length.toString();
    const contentStartBuffer = Buffer.from(contentToVerify.substring(0, Math.min(contentToVerify.length, 20)));
    const contentStartIndex = bodyBuffer.indexOf(contentStartBuffer);

    if (contentStartIndex === -1) {
        throw new Error(`Content not found in email body: "${contentToVerify}"`);
    }

    const emailHeaderArray = emailVerifierInputs.emailHeader.map((c) => Number(c));
    const headerBuffer = Buffer.from(emailHeaderArray);
    const fromEmailIndex = headerBuffer.indexOf(Buffer.from('from:'));

    if (fromEmailIndex === -1) {
        throw new Error("From: header not found in email header");
    }


    const tree = await MerkleTree.buildTree(bodyArray)


    const continousSegment = []
    for (let i = contentStartIndex; i < contentStartIndex + contentArray.length; i++) {
        continousSegment.push(i);
    }

    const firstGenIdx = generalisedIndex(continousSegment[0], tree.height);
    const lastGenIdx = generalisedIndex(continousSegment[continousSegment.length - 1], tree.height);

    const { auditPath } = tree.getMultiProof(continousSegment);

    if (contentArray.length < MAX_CONTENT_LENGTH) {
        for (let i = contentArray.length; i < MAX_CONTENT_LENGTH; i++) {
            contentArray.push('0');
        }
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
        bodyMerkleRoot: tree.getRoot().toString(),
        contentLength,
        firstGenIdx: firstGenIdx.toString(),
        lastGenIdx: lastGenIdx.toString(),
        auditPath: auditPath.map((path) => path.map((p) => p.toString())).slice(1),
    };
}

