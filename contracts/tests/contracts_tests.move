// Test for verifier contract
#[test_only]
module contracts::verifier_tests {
    use std::string::{Self, String};
    use sui::test_scenario::{Self as ts, ctx};
    use sui::groth16;
    use contracts::verifier::{Self, Vk, Leak, get_blob_id};
    use sui::groth16::bn254;
    use std::unit_test::assert_eq;
    use std::debug::print;

    const ADMIN: address = @0xA11CE;
    const USER: address = @0xB0B;

  
    #[test]
    fun test_verify_proof() {
        let mut scenario = ts::begin(ADMIN);



        ts::next_tx(&mut scenario, USER);
        {
            let vk_str = x"e2f26dbea299f5223b646cb1fb33eadb059d9407559d7441dfd902e3a79a4d2dabb73dc17fbc13021e2471e0c08bd67d8401f52b73d6d07483794cad4778180e0c06f33bbc4c79a9cadef253a68084d382f17788f885c9afd176f7cb2f036789edf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e19edf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e1904000000000000000af4097d14e4c091542c5f46522235dc1f38d6155c8fe52082234ff53016d093000c1a7abc318c8868610059aefbc1dbd7c1d7cc83ada36902b4e560b3d4f60eed08c91b6bfe29fd1ede6063a58bb30117e7f85516716ab5e49de861fa1f788d912af0efc8e0fffd93eb2822bcef4a2a638f477c3d446266d37da023fca82d27";
            let vk = groth16::prepare_verifying_key(&bn254(), &vk_str);
            print(&vk);
            let proof_points  = x"c22d229a425356e7275caf981461a251fc375d7cfd60d9a1b8b2d99cc451c9a1da14ccec96be869eba1132d03ccd97d2d40c82beab7d10a27e4801334ce87c031c876a049f44f2fe35c3e23b883aa2b1dc097f1bc5c42f601ebf4017a03e13216e9dd3dbe98cc3ddf67ce65311695d6f6ae527a6a078c6f38de6c167f732ca09";
            let public_inputs  = x"88478d48614d0224dcb6b220a15b84e340c5cff0139be8a9e51071dc77c7a90e0a8db7e6092b9d878baa06526492177727a3a728c6f375a3397586667ea5a2032237715302188883a465c66568131dc3047a2d54000000000000000000000000";

            let proof_points = groth16::proof_points_from_bytes(proof_points);
            print(&proof_points);
            let public_inputs = groth16::public_proof_inputs_from_bytes(public_inputs);
            assert_eq!(sui::groth16::verify_groth16_proof(
                &bn254(),
                &vk,
                &public_inputs,
                &proof_points
            ), true);
            
        };
        
        ts::end(scenario);
    }


    #[test]
    fun test_verifier() {
        let mut scenario = ts::begin(ADMIN);

        let empty_vk = x"e2f26dbea299f5223b646cb1fb33eadb059d9407559d7441dfd902e3a79a4d2dabb73dc17fbc13021e2471e0c08bd67d8401f52b73d6d07483794cad4778180e0c06f33bbc4c79a9cadef253a68084d382f17788f885c9afd176f7cb2f036789edf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e19edf692d95cbdde46ddda5ef7d422436779445c5e66006a42761e1f12efde0018c212f3aeb785e49712e7a9353349aaf1255dfb31b7bf60723a480d9293938e1904000000000000000af4097d14e4c091542c5f46522235dc1f38d6155c8fe52082234ff53016d093000c1a7abc318c8868610059aefbc1dbd7c1d7cc83ada36902b4e560b3d4f60eed08c91b6bfe29fd1ede6063a58bb30117e7f85516716ab5e49de861fa1f788d912af0efc8e0fffd93eb2822bcef4a2a638f477c3d446266d37da023fca82d27";
        let empty_proof = x"c22d229a425356e7275caf981461a251fc375d7cfd60d9a1b8b2d99cc451c9a1da14ccec96be869eba1132d03ccd97d2d40c82beab7d10a27e4801334ce87c031c876a049f44f2fe35c3e23b883aa2b1dc097f1bc5c42f601ebf4017a03e13216e9dd3dbe98cc3ddf67ce65311695d6f6ae527a6a078c6f38de6c167f732ca09";
        let empty_inputs = x"88478d48614d0224dcb6b220a15b84e340c5cff0139be8a9e51071dc77c7a90e0a8db7e6092b9d878baa06526492177727a3a728c6f375a3397586667ea5a2032237715302188883a465c66568131dc3047a2d54000000000000000000000000";

        ts::next_tx(&mut scenario, ADMIN);
        {
            verifier::create_vk( empty_vk, ctx(&mut scenario));
        };

        ts::next_tx(&mut scenario, USER);
        {
            let vk = ts::take_shared<Vk>(&scenario);
            
            verifier::verify_zeroleaks_proof(
                &vk,
                empty_proof,
                empty_inputs,
                ctx(&mut scenario)
            );
            
            ts::return_shared(vk);
        };

        ts::end(scenario);
    }

}
