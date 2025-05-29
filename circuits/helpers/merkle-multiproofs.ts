// Makes a merkle multiproofs. Allowing proving membership of a whole set of points at once
// For example if we are proving membership for positions at 0,1,6,8
//        .
//    .       .
//  .   *   *   .
// x x . . . . x *
// we only need * nodes in our path to prove membership
import { bytesToBigInt } from "@zk-email/helpers";
import { buildMimc7, Mimc7 } from "circomlibjs";

type Numberish = number | bigint | string;

interface MerkleMultiProofsArgs {
    paths: any
}

type GeneralisedIndex = number;

// the generalised index is 2**y + x
const generalisedIndex = (x: number, y: number): GeneralisedIndex => {
    return 2 ** y + x;
}

// for left child k the generalised index of parent is k / 2 and for right child k the generalised index of parent is (k - 1) / 2
const getParentGeneralisedIndex = (childGeneralisedIndex: GeneralisedIndex) => {
    return Math.floor(childGeneralisedIndex / 2);
}


/// A custom merkle tree rather than using the sparse merkle tree in circomlibjs 
export class MerkleTree {

    nodeMap: Map<number, bigint>;
    height: number;

    constructor(nodeMap: Map<number, bigint>, height: number) {
        this.nodeMap = nodeMap;
        this.height = height;
    }

    static hash(left: Numberish, right: Numberish, mimc: Mimc7): bigint {
        // Mimc7 hash function
        return bytesToBigInt(mimc.multiHash([BigInt(left), BigInt(right)]));
    }

    // we pad the leafnodes to the next power of 2
    // makes a tree from the emailContent
    static async buildTree(
        emailContent: number[]
    ) {
        const mimc = await buildMimc7();
        const height = Math.ceil(Math.log2(emailContent.length));
        const leafNodes = [...emailContent].fill(0, emailContent.length, Math.pow(2, height));

        let nodes = leafNodes.map((value) => BigInt(value));
        let nodeMap = new Map<number, bigint>();

        for (let y = height; y > 0; y--) {
            let newNodes: bigint[] = [];

            for (let x = 0; x < nodes.length; x += 2) {
                const left = nodes[x];
                const right = nodes[x + 1];
                const hash = this.hash(left, right, mimc);
                newNodes.push(hash);
                nodeMap.set(generalisedIndex(x, y), left);
                nodeMap.set(generalisedIndex(x + 1, y), right);
            }

            nodes = newNodes;
        }
        nodeMap.set(generalisedIndex(0, 0), nodes[0]); // root node
        return new MerkleTree(nodeMap, height);
    }

    getRoot(): bigint {
        const root = this.nodeMap.get(1);
        if (root === undefined) {
            throw new Error("Root not found in node map");
        }
        return root;
    }

    // getMultiProof(
    //     contentPositions: number[]
    // ) {
    //     const auditPath: Set<number>[] = Array.from({ length: this.height }, () => new Set());
    //     for (const position of contentPositions) {
    //         let nodeIndex = generalisedIndex(position, this.height);
    //         for (let y = this.height; y > 0; y--) {
    //             const siblingIndex = nodeIndex % 2 === 0 ? nodeIndex + 1 : nodeIndex - 1;
    //             console.log(siblingIndex)
    //             auditPath[y - 1].add(siblingIndex)
    //             nodeIndex = getParentGeneralisedIndex(nodeIndex)
    //         }
    //     }
    //     console.log(auditPath)

    //     // remove the sibling audit path. if k and k + 1 are in set where k is the left sibling then delete both
    //     for (let y = 0; y < this.height; y++) {
    //         const currentSet = auditPath[y];
    //         for (const k of currentSet) {
    //             if (k % 2 === 0) {
    //                 if (currentSet.has(k + 1)) {
    //                     currentSet.delete(k + 1);
    //                     currentSet.delete(k);
    //                 }
    //             }
    //         }
    //     }
    //     // remove zeroe set's from the audit path
    //     const filteredAuditPath = auditPath.filter(set => set.size > 0);
    //     console.log(filteredAuditPath);

    //     const siblings = filteredAuditPath.map(set => Array.from(set).map(index => this.nodeMap.get(index)!));

    //     return {
    //         auditPath: siblings, // remove the root node from the audit path
    //     };
    // }

    getContinousSetProof() { }

}
