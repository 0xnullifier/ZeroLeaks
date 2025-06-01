module contracts::zl;
use sui::coin::{Self, Coin, TreasuryCap };

/// The governance token type
public struct ZL has drop {}

/// Initializes the ZL token
fun init(witness: ZL, ctx: &mut TxContext) {
    let name = b"ZL Token";
    let symbol = b"ZL";
    let description = b"Governance token for the DAO";
    let decimals = 9u8;

    let (treasury_cap, metadata) = coin::create_currency<ZL>(
        witness, decimals, name, symbol, description, option::none(), ctx
    );

    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury_cap, contracts::dao_allowlist)
}


public fun mint(
    treasury_cap: &mut TreasuryCap<ZL>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
}

/// Manager can burn coins
public fun burn(treasury_cap: &mut TreasuryCap<ZL>, coin: Coin<ZL>) {
    coin::burn(treasury_cap, coin);
}