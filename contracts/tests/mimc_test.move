#[test_only]
module contracts::mimc_test {
    use contracts::mimc;
    use std::debug::print;
    #[test]
    fun add() {
        let a: u256 = 14474011154664524427946373126085988481658748083205070504932198000989141204992;
        let b: u256 = 340282366920938463463374607431768211456;
        let expected: u256 = 14474011154664524427946373126085988481999030450126008968395572608420909416448;
        let result: u256 = mimc::add(a, b);
        assert!(result == expected, 0x1); // Replace 0x1 with an appropriate error code
    }
    #[test]
    fun mul() {
        let a: u256 = 3;
        let b: u256 = 7;
        let expected: u256 = 21;
        let result: u256 = mimc::mul(a, b);
        assert!(result == expected, 0x1); // Replace 0x1 with an appropriate error code
    }

    #[test]
    fun hash(){
        let x: u256 = 1;
        let k: u256 = 2;
        let expected: u256 = 10594780656576967754230020536574539122676596303354946869887184401991294982664; // Replace with the expected output
        let result: u256 = mimc::mimc_single(x, k);
        print(&result);
        assert!(result == expected, 0x1); // Replace 0x1 with an appropriate error code
    }
}