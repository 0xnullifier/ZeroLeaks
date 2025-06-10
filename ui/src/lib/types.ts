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
  }[];
  verificationDigest: string;
  proof: ProofResponseJSON;
  author?: string; // wallet address of the leak creator
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

interface Bounty {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  reward: number; // SUI amount
  creator: string; // wallet address
  status: "active" | "completed" | "expired" | "cancelled";
  deadline: string; // ISO date string
  createdAt: string;
  requiredInfo: string; // description of what information is needed
  verificationCriteria: string; // how the information will be verified
  submissions: BountySubmission[];
  submissionCount: number;
}

interface BountySubmission {
  id: string;
  bountyId: string;
  submitter: string; // wallet address
  submittedAt: string;
  zkProof: ProofResponseJSON;
  verificationDigest: string;
  status: "pending" | "verified" | "rejected";
  isWinner?: boolean;
}

export type { Leak, Comment, Bounty, BountySubmission };