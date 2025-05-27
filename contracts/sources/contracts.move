/// A simple groth16 verifier for our circuits
/// This also stores the walrus blob id
module contracts::verifier;

use sui::groth16;
use std::string::String;

public struct Vk has key, store{
    id: UID,
    pvk: vector<u8>,
    admin: address,
}



public struct Leaks has key, store {
    id: UID,
    blob_ids: vector<String>
}

fun init(ctx: &mut TxContext) {
    // Initialize the Leaks object with an empty vector for blob_ids
    let leaks = Leaks {
        id: object::new(ctx),
        blob_ids: vector::empty<String>(),
    };
    transfer::public_share_object(leaks);

}



/// Get the blob_id from a Leak object
/// Makes blob_id publicly accessible
public fun get_blob_ids(leak: &Leaks): vector<String> {
    leak.blob_ids
}


/// Add a new blob_id to the Leaks object
/// There is no pop operation, so once a blob_id is added, it remains in the list.
public fun new_leak(blob_id: String,leak: &mut Leaks, _ctx: &mut TxContext ){
    vector::push_back(&mut leak.blob_ids, blob_id);
}

public fun create_vk(vk: vector<u8>, ctx: &mut TxContext){
    transfer::share_object(
        Vk{
            id: object::new(ctx),
            pvk: vk,
            admin:ctx.sender(),
        }
    )
}

public fun set_new_vk(vk: &mut Vk,new_vk: vector<u8>,ctx:  &mut TxContext){
    assert!(ctx.sender() == vk.admin);
    vk.pvk = new_vk;
}


public fun verify_zeroleaks_proof(
    vk: &Vk,
    proof_points_bytes: vector<u8>,
    public_inputs: vector<u8>,
    _ctx: &mut TxContext
) {
    let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk.pvk);
    let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
    let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs);
    assert!(groth16::verify_groth16_proof(&groth16::bn254(), &pvk, &public_inputs, &proof_points));
}