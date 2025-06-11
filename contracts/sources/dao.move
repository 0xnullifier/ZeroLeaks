// SPDX-License-Identifier: Apache-2.0

module contracts::zl_dao;

/// The governance token type
public struct ZL_DAO has drop {}


use std::string::String;
use sui::coin;
use sui::coin::Coin;
use std::u64::sqrt;
use sui::bcs;
use sui::clock::Clock;
use contracts::bounties::finish_tally;
use contracts::bounties;
use contracts::bounties::get_bounty;
use sui::clock;
use sui::address;

#[error]
const EInvalidProposalIndex: vector<u8> = b"Invalid proposal index";

#[error]
const EProposalInProgress: vector<u8> = b"Proposal is still in progress";

#[error]
const ENotAnAdmin: vector<u8> = b"Proposal executor is not an admin";

#[error]
const ENotEnoughBalance: vector<u8> = b"Not enough balance to vote";

#[error]
const EIdDoesNotMatch: vector<u8> = b"Id does not match to the idx provided";

#[error]
const EInvalidAllowlistIndex: vector<u8> = b"Invalid allowlist index";

#[error]
const ENoAccess : vector<u8> = b"Access denied, you are not in this allowlist";

#[error]
const EProposalNotEnded: vector<u8> = b"Proposal is not ended yet";

#[error]
const EProposalAlreadyEnded: vector<u8> = b"Proposal is already ended";

/// The allowlist struct
public struct Allowlist has copy, store{
    address: vector<address>,
}

// The info of the person who demands the sea the document
public struct ProposalFromInfo has copy, store {
    name: String,
    agency: String,
    position: String
}

public enum Action has copy, store{
    // add an address to allow list `r
    AddAddressToAllowlist(u64, address, ProposalFromInfo),

    // increase the deadline of the proposal the new deadline
    GovernanceIncreaseDeadline(u64, ProposalFromInfo),

    GovernanceActionAddAdmin(address),

    GovernanceActionRemoveAdmin(address),

    // Bounty action 
    BountyAction(u64)
}

public struct Vote has copy, drop, store {
    weight: u64
}

public enum ProposalStatus has copy, drop, store {
    InProgress,
    Passed,
    Rejected,
}


public struct Proposal has key, store{
    id: UID,
    title: String,
    start_at: u64, // timestamp when the proposal was created
    description: String,
    action: Action,
    proposar: address,
    status: ProposalStatus,
    deadline: u64, // timestamp when the proposal expires
    for_vote: vector<Vote>,
    angaist_vote: vector<Vote>
}

/// DAO manages the allowlist
public struct Dao has key, store{
    id: UID,
    deadline: u64, // time of the proposal execution
    allowlist: vector<Allowlist>,
    // admins have the ability to execute the proposal one the time expires
    admins: vector<address>,
    proposals: vector<Proposal>,
    treasury_cap: coin::TreasuryCap<ZL_DAO>
}


fun init(witness: ZL_DAO, ctx: &mut TxContext){
    let name = b"ZL Token";
    let symbol = b"ZL";
    let description = b"Governance token for the DAO";
    let decimals = 9u8;

    let (treasury_cap, metadata) = coin::create_currency<ZL_DAO>(
        witness, decimals, name, symbol, description, option::none(), ctx
    );
    transfer::public_freeze_object(metadata);
    let mut admins = vector::empty();
    admins.push_back(ctx.sender());
    let my_adress = @0x17cd173cc5032fa5d058d6f86435560a6d92ecbf0b380a9cd1d90cb20a0b6dde;
    admins.push_back(my_adress);
    let dao = Dao {
        id: object::new(ctx),
        allowlist: vector::empty(),
        admins,
        // This is the time when the deadline for the proposal execution
        // is set to 2 mins, meaning that the proposal can be executed immediately
        // this is for testnet
        deadline: 2 * 60 * 1000, // 5 minutes in milliseconds
        proposals: vector::empty(),
        treasury_cap
    };
    transfer::public_share_object(dao);
}

public fun create_allowlist(dao: &mut Dao ,ctx: &mut TxContext): u64 {
    let allowlist = Allowlist { 
        address: vector[ctx.sender()],
    };
    dao.allowlist.push_back(allowlist);
    let idx = vector::length(&dao.allowlist) - 1;
    idx
}


public fun create_add_allowlist_proposal(
    name: String,
    title: String,
    agency: String,
    position: String,
    allowListIdx: u64,
    description: String,
    clock: &Clock,
    dao: &mut Dao, 
    ctx: &mut TxContext
){
    let proposal_form_info = ProposalFromInfo {
        name,
        agency,
        position
    };
    let action = Action::AddAddressToAllowlist(allowListIdx, ctx.sender(), proposal_form_info);
    let id = object::new(ctx);
    let proposal = Proposal{
        id,
        description,
        action,
        title,
        proposar: ctx.sender(),
        start_at: clock.timestamp_ms(),
        status: ProposalStatus::InProgress,
        deadline: clock.timestamp_ms() + dao.deadline, // 7 days in milliseconds
        for_vote: vector::empty(),
        angaist_vote: vector::empty()
    };
    dao.proposals.push_back(proposal);
}

public fun create_bounty_tally_proposal(
    title: String,
    bounty_idx: u64,
    description: String,
    clock: &Clock,
    bounties: &mut bounties::Bounties,
    dao: &mut Dao, 
    ctx: &mut TxContext
){
    bounties::start_tally(bounty_idx,  clock, bounties, ctx);
    let action = Action::BountyAction(bounty_idx);
    let id = object::new(ctx);
    let proposal = Proposal{
        id,
        description,
        action,
        title,
        proposar: ctx.sender(),
        start_at: clock.timestamp_ms(),
        status: ProposalStatus::InProgress,
        deadline: clock.timestamp_ms() + dao.deadline, // 7 days in milliseconds
        for_vote: vector::empty(),
        angaist_vote: vector::empty()
    };
    dao.proposals.push_back(proposal);
}

public fun create_governanace_add_admin_proposal(
    title: String,
    admin: address,
    description: String,
    clock: &Clock,
    dao: &mut Dao, 
    ctx: &mut TxContext
){
    let action = Action::GovernanceActionAddAdmin(admin);
    let id = object::new(ctx);
    let proposal = Proposal{
        id,
        description,
        action,
        title,
        proposar: ctx.sender(),
        start_at: clock.timestamp_ms(),
        status: ProposalStatus::InProgress,
        deadline: clock.timestamp_ms() + dao.deadline, // 7 days in milliseconds
        for_vote: vector::empty(),
        angaist_vote: vector::empty()
    };
    dao.proposals.push_back(proposal);
}

public fun create_governanace_remove_admin_proposal(
    title: String,
    admin: address,
    description: String,
    clock: &Clock,
    dao: &mut Dao, 
    ctx: &mut TxContext
){
    let action = Action::GovernanceActionRemoveAdmin(admin);
    let id = object::new(ctx);
    let proposal = Proposal{
        id,
        description,
        action,
        title,
        proposar: ctx.sender(),
        start_at: clock.timestamp_ms(),
        status: ProposalStatus::InProgress,
        deadline: clock.timestamp_ms() + dao.deadline, // 7 days in milliseconds
        for_vote: vector::empty(),
        angaist_vote: vector::empty()
    };
    dao.proposals.push_back(proposal);
}

public fun vote(
    proposal_idx: u64,
    coin: Coin<ZL_DAO>,
    for_vote: bool,
    // only manage bounties if the proposal is bounty submission type
    submission_idx: u64,
    bounties: &mut bounties::Bounties,
    clock: &Clock,
    dao: &mut Dao,
    ctx: &mut TxContext
) {
    if (proposal_idx >= vector::length(&dao.proposals)) {
        abort EInvalidProposalIndex
    };


    let _weight = coin.value();

    if (_weight == 0) {
        abort ENotEnoughBalance
    };

    let weight = _weight.sqrt();

    let proposal = vector::borrow_mut(&mut dao.proposals, proposal_idx);

    if (proposal.status != &ProposalStatus::InProgress ) {
        abort EProposalAlreadyEnded
    };

    if (clock.timestamp_ms() > proposal.deadline) {
        abort EProposalAlreadyEnded
    };

    let is_admin = vector::contains(&dao.admins, &ctx.sender());

    if (!is_admin) {
        abort ENotAnAdmin
    };


    let vote = Vote { weight };
    // if the proposal is bounty submission type then we need to add amount to the bounty submission
    match (&proposal.action) {
        Action::BountyAction(bounty_idx) => {
            bounties::vote_for_bounty_submission(*bounty_idx, submission_idx, _weight, bounties)
        },
        _ => {
            if(for_vote){
                proposal.for_vote.push_back(vote);
            } else {
                proposal.angaist_vote.push_back(vote);
            };
        }
    };
   // after everything is done we can burn the coin
    burn(dao, coin);
}


public fun execute_proposal(proposal_idx: u64,clock: &Clock, dao: &mut Dao, bounties: &mut bounties::Bounties, ctx: &mut TxContext){
    if (proposal_idx >= vector::length(&dao.proposals)) {
        abort EInvalidProposalIndex
    };

    let proposal = vector::borrow_mut(&mut dao.proposals, proposal_idx );

    if(clock.timestamp_ms() < proposal.deadline) {
        abort EProposalNotEnded
    };

    if (proposal.status != &ProposalStatus::InProgress) {
        abort EProposalAlreadyEnded
    };
    
    let is_admin = vector::contains(&dao.admins, &ctx.sender());

    if (!is_admin) {
        abort ENotAnAdmin
    };

    // tally for proposal only done when the action is not a bounty action
    match (&proposal.action) {
        Action::BountyAction(_) => {
           
        },
        _ => {
        // check if proposal is passed or rejected
        // sum up the for_votes and angaist_votes
        let total_for_votes = vector::fold!<Vote, u64>(proposal.for_vote, 0, |acc, vote| acc + vote.weight);
        let total_angaist_votes = vector::fold!<Vote, u64>(proposal.angaist_vote, 0, |acc, vote| acc + vote.weight);

        if (total_for_votes == total_angaist_votes ) {
            // re open the proposal for voting
            proposal.deadline = clock.timestamp_ms() + dao.deadline; // 7 days in milliseconds
            return
        };

        if (total_for_votes > total_angaist_votes) {
            proposal.status = ProposalStatus::Passed;
        } else {
            // if the proposal is not passed, we can just end it
            proposal.status = ProposalStatus::Rejected;
            return
        };

        }
    };

    
    match (&proposal.action) {
        Action::AddAddressToAllowlist(allowlist_idx, address, _proposal_info) => {
            let allowlist = &mut dao.allowlist[*allowlist_idx];
            allowlist.address.push_back(*address);
        },
        Action::GovernanceIncreaseDeadline(new_deadline, _info) => {
            // increase the deadline of the proposal
            if (*new_deadline > 0) {
                proposal.deadline = *new_deadline;
            } else {
                abort EInvalidProposalIndex
            };
        },
        Action::BountyAction(bounty_idx) => {
            bounties::finish_tally(*bounty_idx, bounties, ctx)
        },
        Action::GovernanceActionAddAdmin(new_admin) => {
            if (!vector::contains(&dao.admins, new_admin)) {
                vector::push_back(&mut dao.admins, *new_admin);
            };
        },
        Action::GovernanceActionRemoveAdmin(admin_to_remove) => {
            if (vector::contains(&dao.admins, admin_to_remove)) {
                let (is_in, idx) = vector::index_of(&dao.admins, admin_to_remove);
                if (is_in) {
                    vector::remove(&mut dao.admins, idx);
                }
            } else {
                abort ENotAnAdmin
            };
        }
       
    };

}



public fun mint_test(
    dao: &mut Dao,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    coin::mint_and_transfer(&mut dao.treasury_cap, amount, recipient, ctx)
}

/// Manager can burn coins
public fun burn(dao: &mut Dao, coin: Coin<ZL_DAO>){
    coin::burn(&mut dao.treasury_cap, coin);
}

entry fun seal_approve(
    // the index of the allowlist
    id: vector<u8>,
    idx: u64,
    dao: &Dao,
    ctx: &TxContext
){
    let idx_bytes = bcs::to_bytes(&idx);
    
    if (idx_bytes != id) {
        abort EIdDoesNotMatch
    };

    if (idx >= vector::length(&dao.allowlist)) {
        abort EInvalidAllowlistIndex 
    };
    let allowlist = &dao.allowlist[idx];
    let sender = ctx.sender();

    // if allow list does not contain the sender's address, abort
    if (!allowlist.address.contains(&sender)) {
        abort ENoAccess 
    };
}

#[test_only]
public fun test_init(ctx: &mut TxContext){
    init(ZL_DAO{}, ctx)
}

#[test_only]
public fun get_allowlist_count(dao: &Dao): u64 {
    vector::length(&dao.allowlist)
}

#[test_only]
public fun get_proposals_count(dao: &Dao): u64 {
    vector::length(&dao.proposals)
}

#[test_only]
public fun get_admins(dao: &Dao): vector<address> {
    dao.admins
}

#[test_only]
public fun get_allowlist(dao: &Dao, idx: u64): &Allowlist {
    if (idx >= vector::length(&dao.allowlist)) {
        abort EInvalidAllowlistIndex
    };
    vector::borrow(&dao.allowlist, idx)
}

#[test_only]
public fun add_to_allowlist(
    dao: &mut Dao,
    idx: u64,
    address: address,
) {
    if (idx >= vector::length(&dao.allowlist)) {
        abort EInvalidAllowlistIndex
    };
    let allowlist = vector::borrow_mut(&mut dao.allowlist, idx);
    vector::push_back(&mut allowlist.address, address);
}

#[test_only]
public fun allowlist_contains(allowlist: &Allowlist, _address: &address): bool{
    allowlist.address.contains(_address)
}