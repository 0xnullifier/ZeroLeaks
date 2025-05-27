use std::fs::File;
use std::str::FromStr;

use ark_bn254::Bn254;
use ark_bn254::Fq;
use ark_bn254::Fq2;
use ark_bn254::Fr;
use ark_bn254::G1Affine;
use ark_bn254::G1Projective;
use ark_bn254::G2Projective;
use ark_ec::CurveGroup;
use ark_ec::bls12::G1Prepared;
use ark_ff::BigInt;
use ark_ff::PrimeField;
use ark_groth16::Proof;
use ark_groth16::VerifyingKey;
use ark_serialize::CanonicalDeserialize;
use ark_serialize::CanonicalSerialize;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, CanonicalSerialize, CanonicalDeserialize)]
struct RawVkJSONFr {
    vk_alpha_1: [Fq; 3],
    vk_beta_2: [Fq2; 3],
    vk_gamma_2: [Fq2; 3],
    vk_delta_2: [Fq2; 3],
    IC: Vec<[Fq; 3]>,
}

#[derive(Debug, Serialize, Deserialize)]
struct RawVkJSONStr {
    vk_alpha_1: [String; 3],
    vk_beta_2: [[String; 2]; 3],
    vk_gamma_2: [[String; 2]; 3],
    vk_delta_2: [[String; 2]; 3],
    IC: Vec<[String; 3]>,
}

impl Into<RawVkJSONFr> for RawVkJSONStr {
    fn into(self) -> RawVkJSONFr {
        let IC = self
            .IC
            .iter()
            .map(|str| {
                [
                    Fq::from_str(&str[0]).unwrap(),
                    Fq::from_str(&str[1]).unwrap(),
                    Fq::from_str(&str[2]).unwrap(),
                ]
            })
            .collect();

        RawVkJSONFr {
            vk_alpha_1: self.vk_alpha_1.map(|str| Fq::from_str(&str).unwrap()),
            vk_beta_2: self.vk_beta_2.map(|arr| {
                Fq2::new(
                    Fq::from_str(&arr[0]).unwrap(),
                    Fq::from_str(&arr[1]).unwrap(),
                )
            }),
            vk_gamma_2: self.vk_gamma_2.map(|arr| {
                Fq2::new(
                    Fq::from_str(&arr[0]).unwrap(),
                    Fq::from_str(&arr[1]).unwrap(),
                )
            }),
            vk_delta_2: self.vk_delta_2.map(|arr| {
                Fq2::new(
                    Fq::from_str(&arr[0]).unwrap(),
                    Fq::from_str(&arr[1]).unwrap(),
                )
            }),
            IC,
        }
    }
}

fn main() {
    let path = "./verification_key.json";
    let file = File::open(path).unwrap();
    let vk_str: RawVkJSONStr = serde_json::from_reader(file).unwrap();
    let vk_fr: RawVkJSONFr = vk_str.into();
    let vk_alpha_1 = G1Projective::new(
        vk_fr.vk_alpha_1[0],
        vk_fr.vk_alpha_1[1],
        vk_fr.vk_alpha_1[2],
    )
    .into_affine();

    let mut alpha_g1_bytes = Vec::new();
    vk_alpha_1
        .serialize_compressed(&mut alpha_g1_bytes)
        .unwrap();

    let vk_beta_2 =
        G2Projective::new(vk_fr.vk_beta_2[0], vk_fr.vk_beta_2[1], vk_fr.vk_beta_2[2]).into_affine();

    let vk_gamma_2 = G2Projective::new(
        vk_fr.vk_gamma_2[0],
        vk_fr.vk_gamma_2[1],
        vk_fr.vk_gamma_2[2],
    )
    .into_affine();

    let vk_delta_2 = G2Projective::new(
        vk_fr.vk_delta_2[0],
        vk_fr.vk_delta_2[1],
        vk_fr.vk_delta_2[2],
    )
    .into_affine();

    let IC: Vec<G1Affine> = vk_fr
        .IC
        .iter()
        .map(|cords| G1Projective::new(cords[0], cords[1], cords[2]).into_affine())
        .collect();

    let vk: VerifyingKey<Bn254> = VerifyingKey {
        alpha_g1: vk_alpha_1,
        beta_g2: vk_beta_2,
        gamma_abc_g1: IC,
        gamma_g2: vk_gamma_2,
        delta_g2: vk_delta_2,
    };

    let mut vk_bytes = Vec::new();
    vk.serialize_compressed(&mut vk_bytes).unwrap();
    println!("{:?}", vk_bytes);

    let proof_bytes = hex::decode("c22d229a425356e7275caf981461a251fc375d7cfd60d9a1b8b2d99cc451c9a1da14ccec96be869eba1132d03ccd97d2d40c82beab7d10a27e4801334ce87c031c876a049f44f2fe35c3e23b883aa2b1dc097f1bc5c42f601ebf4017a03e13216e9dd3dbe98cc3ddf67ce65311695d6f6ae527a6a078c6f38de6c167f732ca09").unwrap();
    let proof: Proof<Bn254> = Proof::deserialize_compressed(&proof_bytes[..]).unwrap();

    let public_inputs = vec![
        Fr::from_bigint(
            BigInt::from_str(
                "6632353713085157925504008443078919716322386156160602218536961028046468237192",
            )
            .unwrap(),
        )
        .unwrap(),
        Fr::from_bigint(
            BigInt::from_str(
                "1644309966141564456935124153879060428163391496637267861075548215621054860554",
            )
            .unwrap(),
        )
        .unwrap(),
        Fr::from_bigint(
            BigInt::from_str("480569387602499969934763244407234404933182764834").unwrap(),
        )
        .unwrap(),
    ];

    println!("{:?}", public_inputs[0].into_bigint().0);

    let mut file =
        File::open("/Users/utkarshdagoat/dev/sui_overflow/circuits/keys/circuit_v1_3.zkey")
            .unwrap();
    let (proving_key, _) = read_zkey(&mut file).unwrap();

    let vk = proving_key.vk;
    let mut bytes = Vec::new();
    vk.serialize_compressed(&mut bytes).unwrap();

    let pvk = prepare_verifying_key(&vk);

    let hex_str = hex::encode(bytes);
    println!("hex_str {}", hex_str);
    // Save hex_str to a file
    std::fs::write("verifying_key.hex", &hex_str).unwrap();

    let verified =
        Groth16::<Bn254>::verify_with_processed_vk(&pvk, &public_inputs[..], &proof).unwrap();

    let mut public_inputs_serialized = Vec::new();
    public_inputs.iter().for_each(|input| {
        input
            .serialize_compressed(&mut public_inputs_serialized)
            .unwrap();
    });
    println!("Public inputs: {}", hex::encode(public_inputs_serialized));
    println!("verified {}", verified);
    assert!(verified);
    println!("{:?}", G1Projective::zero());
    println!("{:?}", G2Projective::zero());
    let result =
        fastcrypto_zkp::bn254::api::verify_groth16(&pvk, &public_bytes, &proof_bytes).unwrap();
    println!("{:?}", result)

    println!("{:?}", proof);
    // let proofBytes: Vec<u8> = vec![
    //     34, 141, 66, 158, 238, 166, 226, 173, 63, 68, 121, 7, 153, 229, 82, 213, 66, 131, 92, 147,
    //     132, 97, 71, 8, 59, 146, 186, 74, 149, 43, 167, 23, 52, 219, 248, 180, 212, 69, 71, 54,
    //     168, 142, 39, 163, 231, 41, 227, 189, 244, 128, 79, 216, 107, 112, 242, 206, 57, 157, 55,
    //     225, 119, 250, 136, 37, 131, 191, 79, 181, 103, 183, 49, 234, 99, 234, 86, 70, 230, 218,
    //     172, 233, 77, 146, 196, 53, 131, 119, 184, 64, 228, 101, 219, 64, 33, 176, 242, 152, 126,
    //     59, 54, 250, 39, 79, 204, 82, 50, 133, 192, 40, 72, 174, 79, 70, 59, 205, 66, 112, 9, 188,
    //     149, 44, 232, 137, 117, 8, 158, 119, 61, 145,
    // ];
    // let proof: Proof<Bn254> = Proof::deserialize_compressed(&proofBytes[..]).unwrap();
    // let pi_a = G1Projective::from(proof.a);
    // let pi_b = G2Projective::from(proof.b);
    // let pi_c = G1Projective::from(proof.c);
    // println!("{:?}", pi_a);
    // println!("{:?}", pi_b);
    // println!("{:?}", pi_c);
    // let fr_elements: [u8; 96] = [
    //     136, 71, 141, 72, 97, 77, 2, 36, 220, 182, 178, 32, 161, 91, 132, 227, 64, 197, 207, 240,
    //     19, 155, 232, 169, 229, 16, 113, 220, 119, 199, 169, 14, 10, 141, 183, 230, 9, 43, 157,
    //     135, 139, 170, 6, 82, 100, 146, 23, 119, 39, 163, 167, 40, 198, 243, 117, 163, 57, 117,
    //     134, 102, 126, 165, 162, 3, 222, 109, 11, 10, 178, 12, 217, 209, 156, 10, 56, 11, 191, 236,
    //     146, 109, 10, 86, 53, 100, 248, 214, 88, 208, 165, 47, 3, 197, 60, 23, 205, 23,
    // ];
    // let chunks: Vec<Vec<u8>> = fr_elements.chunks(32).map(|chunk| chunk.to_vec()).collect();
    // println!("{:?}", chunks.len());
    // for chunk in chunks {
    //     let deserialed = Fr::deserialize_compressed(&chunk[..]).unwrap();
    //     print!("{:?}\n", deserialed);
    // }
}
