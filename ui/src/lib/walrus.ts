import { AGGREGATOR, PUBLISHER } from "./constant";
import axios from "axios";

const uploadFile = async (fileBuffer: ArrayBuffer) => {
    const url = `${PUBLISHER}/v1/blobs`;

    const response = await axios({
        method: 'put',
        url: url,
        data: fileBuffer,
        headers: {
            'Content-Type': 'application/octet-stream'
        }
    });

    const jsonResponse = response.data;

    if (jsonResponse.alreadyCertified) {
        return jsonResponse.alreadyCertified.blobId;
    }
    return jsonResponse.newlyCreated.blobObject.blobId;
}


async function get(blobId: string): Promise<ArrayBuffer> {
    try {
        const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });

        return response.data;
    } catch (error: any) {
        console.error(`Error downloading blob: ${error.message}`);
        throw new Error(`Failed to download blob with ID ${blobId}: ${error.message}`);
    }
}

export { uploadFile, get };
