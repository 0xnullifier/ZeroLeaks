module contracts::bounties;


// handles the bounties put up by people on zero leaks

use std::string::String;
use sui::clock::Clock;
use sui::coin::Coin;
use sui::sui::SUI;
use sui::balance::Balance;
use sui::coin;
use sui::groth16;
use std::debug::print;
use sui::event;

#[error]
const ENotEnoughBalance: vector<u8> = b"Not enough balance to create a bounty";

#[error]
const EInvalidBountyIndex: vector<u8> = b"Invalid bounty index";

#[error]
const EInvalidBountyStatus: vector<u8> = b"Bounty is not open for claiming";

#[error]
const EInvalidBountySubmission: vector<u8> = b"Bounty submission is invalid. The proof is not verified";

#[error]
const EBountyFinished: vector<u8> = b"The deadline for the bounty has passed";

#[error]
const EInvalidBountySubmissionIndex: vector<u8> = b"Invalid bounty submission index";

#[error]
const EInvalidVoteAmount: vector<u8> = b"Invalid vote amount, you cannot vote with zero balance";

#[error]
const EBountyNotClosed: vector<u8> = b"Bounty is not closed, you cannot withdraw remaining amount";

#[error]
const ENotBountyCreator: vector<u8> = b"You are not the creator of this bounty";


public struct BountyFinished has copy, drop, store {
    bounty_from: address, // the address of the bounty creator
    reward: u64, // the amount of reward for the bounty
}

// BountyStatus enum represents the status of a bounty
public enum BountyStatus has copy, drop, store {
    Open,
    Claimed(u64), // number of rewards claimed
    Tally,
    Closed,
}

public struct BountySubmission has copy,drop, store {
    proof_points_bytes: vector<u8>,
    public_inputs: vector<u8>,
    by: address,
    content: String,
    detailed_article: String,
    votes: u64, // the number of votes for this submission
}

// Bounty struct represents a bounty put up by a user
public struct Bounty has store{
    title: String,
    description: String,
    required_information: String,
    verification_criteria: String,
    category: String,
    tags: vector<String>,
    status: BountyStatus,
    amount: u64,
    creator: address,
    created_at: u64, // timestamp when the bounty was created
    deadline: u64,
    numberOfRewards: u64,
    vk_bytes: vector<u8>,
    coin: Balance<SUI>,
    submissions: vector<BountySubmission>,
}

public struct Bounties has key, store {
    id: UID,
    bounties: vector<Bounty>,
}

fun init(ctx: &mut TxContext) {
    // Initialize the Bounties object with an empty vector for bounties
    let bounties = Bounties {
        id: object::new(ctx),
        bounties: vector::empty<Bounty>(),
    };
    transfer::public_share_object(bounties);
}


public fun create_bounty(
    title: String,
    description: String,
    required_information: String,
    verification_criteria: String,
    category: String,
    tags: vector<String>,
    amount: u64,
    deadline: u64,
    vk_bytes: vector<u8>,
    numberOfRewards: u64,
    _coin: Coin<SUI>,
    clock: &Clock,
    bounties: &mut Bounties,
    ctx: &mut TxContext
){  
    let amount_in_sui = _coin.value();

    if(amount_in_sui < amount * numberOfRewards) {
        abort ENotEnoughBalance
    };

    let balance = coin::into_balance(_coin);

    let bounty = Bounty {
        title,
        description,
        required_information,
        verification_criteria,
        created_at: clock.timestamp_ms(),
        category,
        tags,
        status: BountyStatus::Open,
        amount,
        creator: ctx.sender(),
        deadline: clock.timestamp_ms() + deadline, // deadline in seconds from now
        numberOfRewards,
        vk_bytes,
        coin: balance,
        submissions: vector::empty()
    };

    bounties.bounties.push_back(bounty);
}


public fun submit_for_bounty(
    content: String,
    detailed_article:String,
    bounty_idx: u64,
    proof_points_bytes: vector<u8>,
    public_inputs: vector<u8>,
    clock: &Clock,
    bounties: &mut Bounties,
    ctx: &mut TxContext
) {

    // one should check if content = content_hash from the circuit but we don't have the functionality for onchain 
    // mimc hash yet coming soon
    
    if (bounty_idx >= vector::length(&bounties.bounties)) {
        abort EInvalidBountyIndex
    };

    let bounty = &mut bounties.bounties[bounty_idx];

    if (bounty.status == BountyStatus::Tally) {
        abort EInvalidBountyStatus
    };

    // Check if the bounty deadline has passed
    if (clock.timestamp_ms() > bounty.deadline) {
        bounty.status = BountyStatus::Tally;
        abort EBountyFinished
    };

    let pvk = groth16::prepare_verifying_key(&groth16::bn254(), &bounty.vk_bytes);
    let proof_points = groth16::proof_points_from_bytes(proof_points_bytes);
    let public_inputs_ = groth16::public_proof_inputs_from_bytes(public_inputs);

    let is_valid = groth16::verify_groth16_proof(
        &groth16::bn254(),
        &pvk,
        &public_inputs_,
        &proof_points,
    );

    if (!is_valid) {
        abort EInvalidBountySubmission
    };

    // update the bounty status
    match (bounty.status) {
        BountyStatus::Open => {
            bounty.status = BountyStatus::Claimed(1);
        },
        BountyStatus::Claimed(count) => {
            bounty.status = BountyStatus::Claimed(count + 1);
        },
        _ => {},
    };

    // add the submission to the bounty
    let submission = BountySubmission {
        proof_points_bytes,
        public_inputs,
        detailed_article,
        by: ctx.sender(),
        content,
        votes: 0, // initial votes are 0
    };
    vector::push_back(&mut bounty.submissions, submission);

}

public(package) fun start_tally(
    bounty_idx: u64,
    clock: &Clock,
    bounties: &mut Bounties,
    ctx: &TxContext
) {
    if (bounty_idx >= vector::length(&bounties.bounties)) {
        abort EInvalidBountyIndex
    };

    let bounty = &mut bounties.bounties[bounty_idx];

    if (bounty.creator != ctx.sender()) {
        abort ENotBountyCreator // only the creator of the bounty can start the tally
    };


    match (bounty.status) {
        BountyStatus::Open => {
        },
        BountyStatus::Claimed(_) => {
        },
        _ => {
            abort EInvalidBountyStatus // cannot start tally for a bounty that is not open or claimed
        }
    };

    // Check if the bounty deadline has passed
    if (clock.timestamp_ms() < bounty.deadline) {
        abort EBountyFinished
    };

    // update the bounty status to Tally
    bounty.status = BountyStatus::Tally;

}

public(package) fun finish_tally(
    bounty_idx: u64,
    bounties: &mut Bounties,
    ctx: &mut TxContext
) {
    if (bounty_idx >= vector::length(&bounties.bounties)) {
        abort EInvalidBountyIndex
    };

    let bounty = &mut bounties.bounties[bounty_idx];

    if (bounty.status != BountyStatus::Tally) {
        abort EInvalidBountyStatus // cannot finish tally if the bounty is not in Tally status
    };
    // Create a vector to track rewarded submission indices
    let mut rewarded_indices = vector::empty<u64>();
    let num_submissions = vector::length(&bounty.submissions);
    print(&num_submissions);
    let mut rewards_given = 0;
    while (rewards_given < bounty.numberOfRewards) {
        let mut top_votes = 0;
        let mut top_index: u64 = 0;
        let mut found = false;

        let mut j = 0;
        while (j < num_submissions) {
            // Skip already rewarded submissions
            let mut already_rewarded = false;
            let mut k = 0;
            let rewarded_len = vector::length(&rewarded_indices);
            while (k < rewarded_len) {
                if (rewarded_indices[k] == j) {
                    already_rewarded = true;
                    break
                };
                k = k + 1;
            };
            if (!already_rewarded) {
                let submission = &bounty.submissions[j];
                if (submission.votes > top_votes) {
                    top_votes = submission.votes;
                    top_index = j;
                    found = true;
                };
            };
            j = j + 1;
        };

        if (!found || top_votes == 0) {
            break // No more submissions with votes
        };

        // Payout the top submission
        let reward = coin::take(&mut bounty.coin, bounty.amount, ctx);
        let top_submission = &bounty.submissions[top_index];
        print(&reward);
        transfer::public_transfer(reward, top_submission.by);

        event::emit(BountyFinished { bounty_from: top_submission.by, reward: bounty.amount });

        vector::push_back(&mut rewarded_indices, top_index);
        rewards_given = rewards_given + 1;
    };
    // update the bounty status to Closed
    bounty.status = BountyStatus::Closed;

    withdraw_remaining_amount(bounty, ctx);
}

public(package) fun vote_for_bounty_submission(
    bounty_idx: u64,
    submission_idx: u64,
    vote_amount: u64,
    bounties: &mut Bounties,
) {
    if (bounty_idx >= vector::length(&bounties.bounties)) {
        abort EInvalidBountyIndex
    };

    let bounty = &mut bounties.bounties[bounty_idx];

    if (bounty.status != BountyStatus::Tally) {
        abort EInvalidBountyStatus // cannot vote if the bounty is not in Tally status
    };

    if (submission_idx >= vector::length(&bounty.submissions)) {
        abort EInvalidBountySubmissionIndex
    };

    let submission = &mut bounty.submissions[submission_idx];


    if (vote_amount == 0) {
        abort EInvalidVoteAmount // cannot vote with zero balance
    };

    // add the vote amount to the submission
    submission.votes = submission.votes + vote_amount;
}

public(package) fun withdraw_remaining_amount(
    bounty: &mut Bounty,
    ctx: &mut TxContext
) {
    
    if (bounty.status != BountyStatus::Closed) {
        abort EBountyNotClosed // cannot withdraw remaining amount if the bounty is not closed
    };
    let remaining_amount = bounty.coin.value();
    let remaining_amount = coin::take(&mut bounty.coin, remaining_amount, ctx);
    transfer::public_transfer(remaining_amount, bounty.creator);
}


#[test_only]
public fun test_init(ctx: &mut TxContext) {
    init(ctx)
}
#[test_only]
public fun get_bounties_count(bounties:&Bounties): u64{
    bounties.bounties.length()
}

#[test_only]
public fun get_submissions_count(bounty: &Bounty): u64{
    bounty.submissions.length()
}


public(package) fun get_bounty(bounties: &Bounties, idx: u64): &Bounty{
    let bounty = &bounties.bounties[idx];
    bounty
}

#[test_only]
public fun check_bounty_status_is_tally(bounty: &Bounty): bool {
    bounty.status == BountyStatus::Tally
}

#[test_only]
public fun check_bounty_status_is_closed(bounty: &Bounty): bool {
    bounty.status == BountyStatus::Closed
}

#[test_only]
public fun get_submission(bounty: &Bounty, idx: u64): BountySubmission {
    bounty.submissions[idx]
}

#[test_only]
public fun get_submission_votes(submissions: &BountySubmission): u64 {
    submissions.votes
}

#[test_only]
public fun get_bounty_balance(bounty: &Bounty): &Balance<SUI> {
    &bounty.coin
}