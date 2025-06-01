// SPDX-License-Identifier: Apache-2.0

module contracts::dao_allowlis;
use std::string::String;
use contracts::zl::ZL;
use sui::coin::{Self, Coin};
use sui::coin::TreasuryCap;
use sui::test_scenario::ctx;
use contracts::zl::burn;

const EInvalidCap: u64 = 0;
const ENoAccess: u64 = 1;
const EDuplicate: u64 = 2;
const EVoteAlreadyCast: u64 = 3;
const MARKER: u64 = 3;

public struct Allowlist has key, store {
    id: UID,
    name: String,
    list: vector<address>,
}

public struct Cap has key, store {
    id: UID,
    allowlist_id: ID,
}

public struct Dao has key {
    id: UID,
    proposals: vector<Proposal>,
    treasury_cap: TreasuryCap<ZL>,
}

public struct Proposal has key, store {
    id: UID,
    description: String,
    target: address,
    action_add: bool,
    votes_for: u64,
    votes_against: u64,
    voted: vector<address>,
    executed: bool,
}

public fun create_allowlist(name: String, ctx: &mut TxContext): Cap {
    let allowlist = Allowlist {
        id: object::new(ctx),
        list: vector[ctx.sender()],
        name: name,
    };
    let cap = Cap {
        id: object::new(ctx),
        allowlist_id: object::id(&allowlist),
    };
    cap
}


public fun add(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    assert!(!allowlist.list.contains(&account), EDuplicate);
    allowlist.list.push_back(account);
}

public fun remove(allowlist: &mut Allowlist, cap: &Cap, account: address) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    allowlist.list = allowlist.list.filter!(|x| *x != account);
}

public fun create_proposal(
    description: String,
    target: address,
    action_add: bool,
    ctx: &mut TxContext
): Proposal {
    Proposal {
        id: object::new(ctx),
        description,
        target,
        action_add,
        votes_for: 0,
        votes_against: 0,
        voted: vector::empty(),
        executed: false,
    }
}

public entry fun vote(
    proposal: &mut Proposal,
    in_favor: bool,
    dao: &mut Dao,
    zl_coin: Coin<ZL>,
    ctx: &TxContext
) {
    let sender = ctx.sender();
    assert!(!proposal.voted.contains(&sender), EVoteAlreadyCast);
    proposal.voted.push_back(sender);

    let voting_power = coin::value(&zl_coin);

    if (in_favor) {
        proposal.votes_for = proposal.votes_for + voting_power;
    } else {
        proposal.votes_against = proposal.votes_against + voting_power;
    };

    burn(&mut dao.treasury_cap, zl_coin);
}

public entry fun execute_proposal(
    proposal: &mut Proposal,
    allowlist: &mut Allowlist,
    cap: &Cap
) {
    assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
    assert!(!proposal.executed, EInvalidCap);
    proposal.executed = true;
    if (proposal.votes_for > proposal.votes_against) {
        if (proposal.action_add) {
            if (!allowlist.list.contains(&proposal.target)) {
                allowlist.list.push_back(proposal.target);
            }
        } else {
            allowlist.list = allowlist.list.filter!(|x| *x != proposal.target);
        }
    }
}
