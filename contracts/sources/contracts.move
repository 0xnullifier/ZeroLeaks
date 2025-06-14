/// A simple groth16 verifier for our circuits
/// This also stores the walrus blob id
module contracts::verifier;

use sui::groth16;
use std::string::String;
use contracts::zl_dao::Dao;
use contracts::zl_dao::create_allowlist;


public struct Vk has key, store{
    id: UID,
    pvk: vector<u8>,
    admin: address,
}

public struct Info has copy, drop, store {
    content: String,
    blob_id: String,
    allowlist_idx: u64,
}


public struct Leaks has key, store {
    id: UID,
    info: vector<Info>
}

fun init(ctx: &mut TxContext) {
    // Initialize the Leaks object with an empty vector for blob_ids
    let leaks = Leaks {
        id: object::new(ctx),
        info: vector::empty<Info>(),
    };
    transfer::public_share_object(leaks);
}



/// Get the blob_id from a Leak object
/// Makes blob_id publicly accessible
public fun get_info(leak: &Leaks): vector<Info> {
    leak.info
}


/// Add a new blob_id to the Leaks object
/// There is no pop operation, so once a blob_id is added, it remains in the list.
public fun new_leak(
    blob_id: String,
    content_to_verify: String,
    leak: &mut Leaks,
    vk: &Vk,
    proof_points_bytes: vector<u8>,
    public_inputs: vector<u8>,
    dao: &mut Dao,
    ctx: &mut TxContext 
){
    let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &vk.pvk);
    let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
    let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs);
    assert!(groth16::verify_groth16_proof(&groth16::bn254(), &pvk, &public_inputs, &proof_points));
    let allowlist_idx = create_allowlist(dao, ctx);
    let info = Info {
        content: content_to_verify,
        blob_id: blob_id,
        allowlist_idx
    };
    vector::push_back(&mut leak.info, info);
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


#[test_only]
public fun test_init(ctx: &mut TxContext) {
    init(ctx);
}