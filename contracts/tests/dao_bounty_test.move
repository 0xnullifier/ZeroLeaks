#[test_only]
module contracts::dao_bounty_test {
    use contracts::zl_dao::{Self, Dao, ZL_DAO};
    use contracts::bounties::{Self, Bounties};
    use sui::test_scenario;
    use sui::clock;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance;
    use std::string;

    const ALICE: address = @0xa11ce;

    #[test]
    fun test_dao_bounty_execution_flow() {
        let mut scenario = test_scenario::begin(ALICE);
        let ctx = test_scenario::ctx(&mut scenario);

        // Initialize DAO and Bounties
        zl_dao::test_init(ctx);
        bounties::test_init(ctx);

        test_scenario::next_tx(&mut scenario, ALICE);
        
        // Get the shared objects
        let mut dao = test_scenario::take_shared<Dao>(&scenario);
        let mut bounties = test_scenario::take_shared<Bounties>(&scenario);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000000); // Set initial timestamp

        // Mint some SUI for bounty creation
        let sui_coin = coin::mint_for_testing<SUI>(10000000000, test_scenario::ctx(&mut scenario)); // 10 SUI

        // Create a bounty
        let bounty_title = string::utf8(b"Test Bounty");
        let bounty_description = string::utf8(b"This is a test bounty for DAO execution");
        let required_info = string::utf8(b"Provide proof of work");
        let verification_criteria = string::utf8(b"Must include valid ZK proof");
        let category = string::utf8(b"Testing");
        let tags = vector[string::utf8(b"test"), string::utf8(b"dao")];
        let bounty_amount = 1000000000; // 1 SUI per reward
        let deadline = 86400000; // 24 hours in milliseconds
        let number_of_rewards = 2;
        
        // Mock verification key bytes for testing
        let vk_bytes = vector[226,242,109,190,162,153,245,34,59,100,108,177,251,51,234,219,5,157,148,7,85,157,116,65,223,217,2,227,167,154,77,45,171,183,61,193,127,188,19,2,30,36,113,224,192,139,214,125,132,1,245,43,115,214,208,116,131,121,76,173,71,120,24,14,12,6,243,59,188,76,121,169,202,222,242,83,166,128,132,211,130,241,119,136,248,133,201,175,209,118,247,203,47,3,103,137,237,246,146,217,92,189,222,70,221,218,94,247,212,34,67,103,121,68,92,94,102,0,106,66,118,30,31,18,239,222,0,24,194,18,243,174,183,133,228,151,18,231,169,53,51,73,170,241,37,93,251,49,183,191,96,114,58,72,13,146,147,147,142,25,237,246,146,217,92,189,222,70,221,218,94,247,212,34,67,103,121,68,92,94,102,0,106,66,118,30,31,18,239,222,0,24,194,18,243,174,183,133,228,151,18,231,169,53,51,73,170,241,37,93,251,49,183,191,96,114,58,72,13,146,147,147,142,25,2,0,0,0,0,0,0,0,22,152,117,215,206,228,83,163,251,131,203,75,59,92,57,108,196,111,159,83,213,19,55,135,167,135,166,106,101,47,97,38,147,231,162,255,6,37,177,169,145,15,207,141,127,172,143,171,103,106,236,136,120,244,55,209,119,65,228,167,165,239,4,38];

        bounties::create_bounty(
            bounty_title,
            bounty_description,
            required_info,
            verification_criteria,
            category,
            tags,
            bounty_amount,
            deadline,
            vk_bytes,
            number_of_rewards,
            sui_coin,
            &clock,
            &mut bounties,
            test_scenario::ctx(&mut scenario)
        );

        // Verify bounty was created
        let bounty_count = bounties::get_bounties_count(&bounties);
        assert!(bounty_count == 1, 0);

        let proof_bytes = vector[219,105,47,148,161,25,76,143,184,46,161,83,187,192,124,74,229,197,123,192,228,150,49,37,78,59,15,65,50,127,196,7,138,193,213,101,86,99,232,29,162,168,105,178,141,237,21,91,235,53,243,229,40,125,94,251,241,131,112,17,139,51,126,16,91,224,23,136,4,238,188,173,53,70,117,236,219,103,17,227,31,227,58,51,145,222,98,99,244,154,104,183,222,38,18,159,56,192,66,13,65,39,242,131,204,2,228,56,250,35,143,59,130,249,215,213,151,59,241,56,188,31,215,226,205,126,216,130];
        let public_inputs = vector[136,71,141,72,97,77,2,36,220,182,178,32,161,91,132,227,64,197,207,240,19,155,232,169,229,16,113,220,119,199,169,14];
        // Submit a bounty submission before deadline
        bounties::submit_for_bounty(
            string::utf8(b"Test Submission"),
            string::utf8(b"Test submission description"),
            0, // bounty_idx
            proof_bytes,
            public_inputs,
            &clock,
            &mut bounties,
            test_scenario::ctx(&mut scenario)
        );
        let bounty = bounties::get_bounty(&bounties, 0);
        // Verify submission was added
        let submission_count = bounties::get_submissions_count(bounty);
        assert!(submission_count == 1, 100);

        // Move time forward to simulate bounty deadline passing
        clock::increment_for_testing(&mut clock, deadline + 1000);

        // Create a DAO proposal for bounty execution (tally)
        let proposal_title = string::utf8(b"Execute Bounty Tally");
        let bounty_idx = 0;
        let proposal_description = string::utf8(b"Proposal to execute tally for the test bounty");

        zl_dao::create_bounty_tally_proposal(
            proposal_title,
            bounty_idx,
            proposal_description,
            &clock,
            &mut bounties,
            &mut dao,
            test_scenario::ctx(&mut scenario)
        );

        // Verify proposal was created
        let proposal_count = zl_dao::get_proposals_count(&dao);
        assert!(proposal_count == 1, 1);

        // Verify bounty status is now in tally
        let bounty = bounties::get_bounty(&bounties, bounty_idx);
        assert!(bounties::check_bounty_status_is_tally(bounty), 2);

        // Mint governance tokens for voting
        let governance_amount = 1000000000; // 1 ZL token
        zl_dao::mint_test(&mut dao, governance_amount, ALICE, test_scenario::ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, ALICE);
        let governance_coin = test_scenario::take_from_sender<Coin<ZL_DAO>>(&scenario);

        // Get the initial bounty balance before execution
        let bounty_before = bounties::get_bounty(&bounties, bounty_idx);
        let initial_balance = balance::value(bounties::get_bounty_balance(bounty_before));

        // Vote on the proposal (for the bounty execution)
        let proposal_idx = 0;
        let submission_idx = 0; // dummy value since there are no submissions
        zl_dao::vote(
            proposal_idx,
            governance_coin,
            true, // vote for
            submission_idx,
            &mut bounties,
            &clock,
            &mut dao,
            test_scenario::ctx(&mut scenario)
        );

        // Move time forward to pass proposal deadline
        clock::increment_for_testing(&mut clock, 2 * 60 * 1000 + 1000); // Past DAO deadline

        // Execute the proposal
        zl_dao::execute_proposal(
            proposal_idx,
            &clock,
            &mut dao,
            &mut bounties,
            test_scenario::ctx(&mut scenario)
        );

        // Verify bounty status is now closed
        let bounty_after = bounties::get_bounty(&bounties, bounty_idx);
        assert!(bounties::check_bounty_status_is_closed(bounty_after), 3);

        // Verify balance changes - since there were no submissions, 
        // all money should have been returned to creator
        let final_balance = balance::value(bounties::get_bounty_balance(bounty_after));
        assert!(final_balance == 0, 4); // All balance should be withdrawn

        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::return_shared(dao);
        test_scenario::return_shared(bounties);
        test_scenario::end(scenario);
    }

}
