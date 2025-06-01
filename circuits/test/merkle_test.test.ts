import { buildPoseidon } from "circomlibjs";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import { bigIntToChunkedBytes, bytesToBigInt, packedNBytesToString } from "@zk-email/helpers/dist/binary-format";
import { MerkleTree } from "../helpers/merkle-multiproofs";

const path = require("path");
const fs = require("fs");
const wasm_tester = require("circom_tester").wasm;


describe("Simple Merkle test", function () {
    jest.setTimeout(10 * 60 * 1000); // 10 minutes

    let circuit: any;

    beforeAll(async () => {
        circuit = await wasm_tester(path.join(__dirname, "../src/simple_merkle.circom"), {
            // NOTE: We are running tests against pre-compiled circuit in the below path
            // You need to manually compile when changes are made to circuit if `recompile` is set to `false`.
            recompile: true,
            output: path.join(__dirname, "../build/simple_merkle"),
            include: [path.join(__dirname, "../node_modules"), path.join(__dirname, "../../../node_modules")],
        });
    });

    it("should generate a merkle tree same as the one in js", async () => {
        let leafNodes = [];
        for (let i = 0; i < (1 << 11); i++) {
            leafNodes.push((Math.floor(Math.random() * 100).toString()))
        }
        const w = await circuit.calculateWitness({ leafNodes })
        await circuit.checkConstraints(w);
        const outputs = await circuit.getOutput(w, { "leafNodes": "2", "root": 1 })
        const root = outputs.root;
        const tree = await MerkleTree.buildTree(leafNodes.map((c) => Number(c)))
        expect(tree.getRoot()).toBe(root)
    })

});