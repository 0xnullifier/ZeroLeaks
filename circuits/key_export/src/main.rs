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

    // let proof_bytes = hex::decode("c22d229a425356e7275caf981461a251fc375d7cfd60d9a1b8b2d99cc451c9a1da14ccec96be869eba1132d03ccd97d2d40c82beab7d10a27e4801334ce87c031c876a049f44f2fe35c3e23b883aa2b1dc097f1bc5c42f601ebf4017a03e13216e9dd3dbe98cc3ddf67ce65311695d6f6ae527a6a078c6f38de6c167f732ca09").unwrap();
    // let proof: Proof<Bn254> = Proof::deserialize_compressed(&proof_bytes[..]).unwrap();

    // let public_inputs = vec![
    //     Fr::from_bigint(
    //         BigInt::from_str(
    //             "6632353713085157925504008443078919716322386156160602218536961028046468237192",
    //         )
    //         .unwrap(),
    //     )
    //     .unwrap(),
    //     Fr::from_bigint(
    //         BigInt::from_str(
    //             "1644309966141564456935124153879060428163391496637267861075548215621054860554",
    //         )
    //         .unwrap(),
    //     )
    //     .unwrap(),
    //     Fr::from_bigint(
    //         BigInt::from_str("480569387602499969934763244407234404933182764834").unwrap(),
    //     )
    //     .unwrap(),
    // ];

    // println!("{:?}", public_inputs[0].into_bigint().0);

    // let mut file =
    //     File::open("/Users/utkarshdagoat/dev/sui_overflow/circuits/keys/circuit_v1_3.zkey")
    //         .unwrap();
    // let (proving_key, _) = read_zkey(&mut file).unwrap();

    // let vk = proving_key.vk;
    // let mut bytes = Vec::new();
    // vk.serialize_compressed(&mut bytes).unwrap();

    // let pvk = prepare_verifying_key(&vk);

    // let hex_str = hex::encode(bytes);
    // println!("hex_str {}", hex_str);
    // // Save hex_str to a file
    // std::fs::write("verifying_key.hex", &hex_str).unwrap();

    // let verified =
    //     Groth16::<Bn254>::verify_with_processed_vk(&pvk, &public_inputs[..], &proof).unwrap();

    // let mut public_inputs_serialized = Vec::new();
    // public_inputs.iter().for_each(|input| {
    //     input
    //         .serialize_compressed(&mut public_inputs_serialized)
    //         .unwrap();
    // });
    // println!("Public inputs: {}", hex::encode(public_inputs_serialized));
    // println!("verified {}", verified);
    // assert!(verified);
    // println!("{:?}", G1Projective::zero());
    // println!("{:?}", G2Projective::zero());
    // let result =
    //     fastcrypto_zkp::bn254::api::verify_groth16(&pvk, &public_bytes, &proof_bytes).unwrap();
    // println!("{:?}", result)

    // println!("{:?}", proof);c
}
