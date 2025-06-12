import type { ProofResponseJSON } from "@/components/leaks/email_info";

interface Leak {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  tags: string[];
  content: string; // plain md to html
  //TODO: add these two things
  fromLeakedEmail: string;
  verifiedClaim: string;
  relatedDocuments: {
    name: string;
    content: string; // blob id
    encrypted: boolean; // true if the document is encrypted
  }[];
  verificationDigest: string;
  proof: ProofResponseJSON;
  author?: string; // wallet address of the leak creator
  allowlistIdx?: number; // index in the allowlist for DAO
}

interface Comment {
  id: string;
  leakId: string;
  content: string;
  author: string; // wallet address
  timestamp: string;
  isOP: boolean; // true if this is the original poster
  parentId?: string; // null for top-level comments, comment ID for replies
  replies?: Comment[]; // nested replies (computed when fetching)
  replyCount?: number; // number of direct replies
}

// Bounty types matching the contract structures
interface Bounty {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  reward: number; // amount per reward (in SUI)
  creator: string; // wallet address
  status: "Open" | "Claimed" | "Tally" | "Closed";
  deadline: number; // timestamp in milliseconds
  createdAt: number; // timestamp
  numberOfRewards: number;
  vkBytes: string; // verification key bytes (hex)
  requiredInfo: string; // specific information requirements
  verificationCriteria: string; // how submissions will be verified
  submissions: BountySubmission[];
  submissionCount?: number; // computed field for UI
}

interface BountySubmission {
  id?: string; // computed field for UI
  proofPointsBytes: string; // hex string
  publicInputs: string; // hex string
  by: string; // email address
  content: string;
  votes: number; // number of votes for this submission
  article: string
}

// DAO types matching the contract structures
interface ProposalInfo {
  name: string;
  agency: string;
  position: string;
}

interface Proposal {
  id: string;
  description: string;
  action: "AddAddressToAllowlist" | "BountyAction"; // enum value
  allowlistIdx?: number; // for AddAddressToAllowlist action
  targetAddress?: string; // for AddAddressToAllowlist action
  proposalInfo?: ProposalInfo; // for AddAddressToAllowlist action
  bountyIdx?: number; // for BountyAction - the bounty being voted on
  status: "InProgress" | "Passed" | "Rejected";
  deadline: number; // timestamp in milliseconds
  forVotes: number; // total weight of for votes
  againstVotes: number; // total weight of against votes
  creator?: string; // computed field for UI
  createdAt?: number; // computed field for UI
}

interface Allowlist {
  encryptedBlobIds: string[];
  addresses: string[];
}

interface Vote {
  weight: number;
}

interface Dao {
  id: string;
  deadline: number; // proposal execution deadline
  allowlists: Allowlist[];
  admins: string[];
  proposals: Proposal[];
}

export type {
  Leak,
  Comment,
  Bounty,
  BountySubmission,
  Proposal,
  ProposalInfo,
  Allowlist,
  Vote,
  Dao
};