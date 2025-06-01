// Makes a merkle multiproofs. Allowing proving membership of a whole set of points at once
// For example if we are proving membership for positions at 0,1,6,8
//        .
//    .       .
//  .   *   *   .
// x x . . . . x *
// we only need * nodes in our path to prove membership
import { buildMimc7, type Mimc7 } from "circomlibjs";

type Numberish = number | bigint | string;

type GeneralisedIndex = number;

// the generalised index is 2**y + x
export const generalisedIndex = (x: number, y: number): GeneralisedIndex => {
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
        return mimc.F.toObject(mimc.hash(BigInt(left), BigInt(right)));

    }

    // we pad the leafnodes to the next power of 2
    // makes a tree from the emailContent
    static async buildTree(
        emailContent: number[]
    ) {
        const mimc = await buildMimc7();
        const height = Math.ceil(Math.log2(emailContent.length));
        console.log(height)
        const leafNodes = [...emailContent];
        if (leafNodes.length < 2 ** height) {
            for (let i = leafNodes.length; i < 2 ** height; i++) {
                leafNodes.push(0); // pad with zeros
            }
        }
        console.log("Leaf nodes: ", leafNodes.length);
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

    getMultiProof(
        contentPositions: number[]
    ) {
        const auditPath: Set<number>[] = Array.from({ length: this.height }, () => new Set());
        for (const position of contentPositions) {
            let nodeIndex = generalisedIndex(position, this.height);
            for (let y = this.height; y > 0; y--) {
                const siblingIndex = nodeIndex % 2 === 0 ? nodeIndex + 1 : nodeIndex - 1;
                auditPath[y - 1].add(siblingIndex)
                nodeIndex = getParentGeneralisedIndex(nodeIndex)
            }
        }

        // remove the sibling audit path. if k and k + 1 are in set where k is the left sibling then delete both
        for (let y = 0; y < this.height; y++) {
            const currentSet = auditPath[y];
            for (const k of currentSet) {
                if (k % 2 === 0) {
                    if (currentSet.has(k + 1)) {
                        currentSet.delete(k + 1);
                        currentSet.delete(k);
                    }
                }
            }
        }

        // remove zeros set's from the audit path
        // const filteredAuditPath = auditPath.filter(set => set.size > 0);
        // console.log(filteredAuditPath);
        // const siblings = filteredAuditPath.map(set => Array.from(set).map(index => this.nodeMap.get(index)!));
        const siblings: bigint[][] = [];
        for (let y = 1; y <= this.height; y++) {
            const currentSet = auditPath[y - 1];
            siblings[y] = [];
            for (const index of currentSet) {
                const hash = this.nodeMap.get(index)!;
                if (index % 2 == 0) {
                    siblings[y][0] = hash;
                } else {
                    siblings[y][1] = hash;
                }
            }
            if (siblings[y][0] === undefined) {
                siblings[y][0] = 0n;
            }
            if (siblings[y][1] === undefined) {
                siblings[y][1] = 0n;
            }
        }
        return {
            auditPath: siblings, // remove the root node from the audit path
        };
    }
    // if is zero at the level of the siblings
    static async generateRoot(continousSegment: number[], auditPath: bigint[][], height: number, firstIndex: number, lastIndex: number): Promise<bigint> {
        const mimc = await buildMimc7();
        let aboveLayer: bigint[] = [];
        let currentLayer = continousSegment.map((value) => BigInt(value));
        firstIndex = generalisedIndex(firstIndex, height);
        lastIndex = generalisedIndex(lastIndex, height);
        for (let y = height; y > 0; y--) {
            if (firstIndex % 2 !== 0) {
                currentLayer.unshift(auditPath[y][0]!);
                firstIndex -= 1;
            }
            if (lastIndex % 2 !== 1) {
                currentLayer.push(auditPath[y][1]!);
                lastIndex += 1;
            }
            for (let x = 0; x < currentLayer.length - 1; x += 2) {
                const left = currentLayer[x];
                const right = currentLayer[x + 1];
                const hash = this.hash(left, right, mimc);
                aboveLayer.push(hash);
            }
            currentLayer = aboveLayer;
            aboveLayer = [];
            firstIndex = getParentGeneralisedIndex(firstIndex);
            lastIndex = getParentGeneralisedIndex(lastIndex);
        }
        return currentLayer[0];
    }

}