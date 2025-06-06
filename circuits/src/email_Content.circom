pragma circom 2.2.1;

// verify an email's content
// public_inputs:(aside_from zkemail)
// - content we want to verify it's max lenght is `MAX_CONTENT_LENGTH`
// 

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "../node_modules/@zk-email/circuits/utils/functions.circom";
include "../node_modules/@zk-email/circuits/email-verifier.circom";
include "../node_modules/@zk-email/circuits/utils/regex.circom";
include "./continous_merkle.circom";


template IsInArray(n) {
    signal input val;
    signal input arr[n];

    signal isEqual[n];
    component eqs[n];

    for (var i = 0; i < n; i++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== val;
        eqs[i].in[1] <== arr[i];
        isEqual[i] <== eqs[i].out;
    }

    var sum = 0;
    for (var i = 0; i < n; i++) {
        sum = sum + isEqual[i];
    }
    // sum should be greater than 0 and obvisouly sum < n
    signal isIn <== GreaterThan(log2Ceil(n))([sum, 0]);
    isIn === 1; 
}

template ZeroLeaksEmailContentVerifier(
    maxHeadersLength,
    maxBodyLength,
    maxContentLength,
    merkleTreeHeight,
    mkTreeMaxlengthBits,
    n,
    k
){

    signal input emailHeader[maxHeadersLength];
    signal input emailHeaderLength;
    signal input pubkey[k];
    signal input signature[k];
    signal input emailBody[maxBodyLength];
    signal input emailBodyLength;
    signal input bodyHashIndex;
    signal input precomputedSHA[32];
    signal input content[maxContentLength];
    signal input address;

    // Content verification input
    signal input bodyMerkleRoot;
    signal input auditPath[merkleTreeHeight][2];
    signal input firstGenIdx;
    signal input lastGenIdx;
    signal input contentLength;

    signal output pubkeyHash;

    // verify the dkim signature in the email header
    component EV = EmailVerifier(maxHeadersLength, maxBodyLength, n, k, 0, 0 ,0 , 0);
    EV.emailHeader <== emailHeader;
    EV.pubkey <== pubkey;
    EV.signature <== signature;
    EV.emailHeaderLength <== emailHeaderLength;
    EV.bodyHashIndex <== bodyHashIndex;
    EV.precomputedSHA <== precomputedSHA;
    EV.emailBody <== emailBody;
    EV.emailBodyLength <== emailBodyLength;


    pubkeyHash <== EV.pubkeyHash;

    // FROM HEADER REGEX: 736,553 constraints
    // Assert fromEmailIndex < emailHeaderLength
    // does not work I don't know why
    // signal isFromIndexValid <== LessThan(log2Ceil(maxHeadersLength))([fromEmailIndex, emailHeaderLength]);
    // isFromIndexValid === 1;
    // signal (fromEmailFound, fromEmailReveal[maxHeadersLength]) <== FromAddrRegex(maxHeadersLength)(emailHeader);
    // fromEmailFound === 1;
    // var maxEmailLength = 255;
    // signal output fromEmailAddrPacks[9] <== PackRegexReveal(maxHeadersLength, maxEmailLength)(fromEmailReveal, fromEmailIndex);


    // Content In Tree Verification: 576302 constraints
    component generateRootFromAuditPath = GenerateRoot(maxContentLength, merkleTreeHeight, mkTreeMaxlengthBits);
    generateRootFromAuditPath.continousSegment <== content;
    generateRootFromAuditPath.segmentSize <== contentLength;
    generateRootFromAuditPath.auditPath <== auditPath;
    generateRootFromAuditPath.firstGenIdx <== firstGenIdx;
    generateRootFromAuditPath.lastGenIdx <== lastGenIdx;

    generateRootFromAuditPath.root === bodyMerkleRoot;

}


component main = ZeroLeaksEmailContentVerifier(1024, 1536, 258, 11, 9, 121, 17);
