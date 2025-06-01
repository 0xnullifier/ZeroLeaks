import { generalisedIndex, MerkleTree } from "../helpers/merkle-multiproofs";

const path = require("path");
const fs = require("fs");
const wasm_tester = require("circom_tester").wasm;

const SEGMENT_SIZE = 256;
const ENTRY_SIZE = 2048;

describe("Email Content Verification Test", function () {
    jest.setTimeout(30 * 60 * 1000); // 30 minutes - circuit compilation can take time

    let circuit: any;
    let tree: MerkleTree;
    let entries: number[] = []

    beforeAll(async () => {
        circuit = await wasm_tester(path.join(__dirname, "../src/continous_merkle.circom"), {
            // NOTE: We are running tests against pre-compiled circuit in the below path
            // You need to manually compile when changes are made to circuit if `recompile` is set to `false`.
            recompile: true,
            output: path.join(__dirname, "../build/continous_merkle"),
            include: [path.join(__dirname, "../node_modules"), path.join(__dirname, "../../../node_modules")],
        });
        for (let i = 0; i < ENTRY_SIZE; i++) {
            entries.push(Math.floor(Math.random() * 1e9));
        }
        tree = await MerkleTree.buildTree(entries);
    });


    it("should generate the correct Merkle Root in circom", async () => {
        const contentPositions = []
        const acutalContentAtThosePositions = []
        for (let i = SEGMENT_SIZE; i < SEGMENT_SIZE * 2; i++) {
            contentPositions.push(i);
            acutalContentAtThosePositions.push(entries[i])
        }

        const { auditPath } = tree.getMultiProof(contentPositions)
        console.log(auditPath)
        const computedRoot = await MerkleTree.generateRoot(acutalContentAtThosePositions, auditPath, tree.height, contentPositions[0], contentPositions[contentPositions.length - 1]);

        expect(computedRoot).toBe(tree.getRoot())

        acutalContentAtThosePositions.push(0)
        acutalContentAtThosePositions.push(0)

        const inputs = {
            continousSegment: acutalContentAtThosePositions,
            auditPath: auditPath.slice(1),
            segmentSize: SEGMENT_SIZE,
            firstGenIdx: generalisedIndex(contentPositions[0], tree.height),
            lastGenIdx: generalisedIndex(contentPositions[SEGMENT_SIZE - 1], tree.height)
        }

        const w = await circuit.calculateWitness(inputs)
        await circuit.checkConstraints(w)
        const outputs = await circuit.getOutput(w, { "root": 1 })
        console.log(outputs.root)
        expect(outputs.root).toBe(tree.getRoot())
    })
});

