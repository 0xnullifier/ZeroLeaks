import localforage from 'localforage';
import { generateEmailContentVerifierCircuitInputs } from './helpers';
import { groth16, zKey } from 'snarkjs';
import { serializeProof, serializePublicSignal, type Proof } from './serializer';

// const zkeySuffix = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];


// async function download(link: string, filename: string) {
//     const response = await fetch(`${link}/${filename}`, { method: 'GET' });
//     if (response.status === 200) {
//         return response;
//     }
// }

// async function downloadFromFileName(baseurl: string, filename: string): Promise<void> {
//     const response = await download(baseurl, filename)
//     if (!response)
//         throw new Error(`Failed to download file from ${baseurl}/${filename}`);
//     const zkBuff = await response.arrayBuffer();
//     await storeArrayBuffer(filename, zkBuff);
// }

// async function storeArrayBuffer(keyname: string, buffer: ArrayBuffer) {
//     return localforage.setItem(keyname, buffer);
// }



// // download the zkey 
// export const downloadZkey = async () => {
//     const promises = []
//     for (const suffix of zkeySuffix) {
//         promises.push(downloadFromFileName(import.meta.env.VITE_ZKEY_DOWNLOAD_URL, `circuit.zkey${suffix}`));
//     }
//     await Promise.all(promises);
// }


export const generateProof = async (email: string, suiAddress: string, content: string): Promise<{ proofHex: string, publicSignals: string }> => {
    console.log("Generating proof for email:");
    const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
        email,
        suiAddress,
        content
    );
    console.log("Email content inputs generated:", emailContentInputs);

    console.log("Starting proof generation...");

    console.time("Generating proof");
    const { proof, publicSignals } = await groth16.fullProve(
        emailContentInputs,
        "/email_content.wasm",
        "circuit.zkey"
    );
    console.log("Proof generated successfully:", proof);

    const proofString = serializeProof(proof as Proof);
    const publicSignalsString = serializePublicSignal(publicSignals);
    console.timeEnd("Generating proof");

    const proofStringHex = Buffer.from(proofString).toString('hex');
    const publicSignalsStringHex = Buffer.from(publicSignalsString).toString('hex');
    return {
        proofHex: proofStringHex,
        publicSignals: publicSignalsStringHex
    };
}