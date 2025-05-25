/// A simple groth16 verifier for our circuits
/// This also stores the walrus blob id
module contracts::verifier;

use sui::groth16;
use std::string::String;
use sui::borrow::borrow;

public struct Vk has key, store{
    id: UID,
    pvk: vector<u8>,
    admin: address,
}

/// This sotres the blob id from walrus. All the relveant infromation are uploaded on walrus
public struct Leak has key, store {
    id: UID,
    blob_id: String
}

/// Get the blob_id from a Leak object
/// Makes blob_id publicly accessible
public fun get_blob_id(leak: &Leak): String {
    leak.blob_id
}

public fun new_leak(ctx: &mut TxContext, blob_id: String){
    transfer::public_freeze_object(
        Leak {
            id: object::new(ctx),
            blob_id
        }
    )
}

public fun create_vk(vk: vector<u8>,ctx: &mut TxContext){
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