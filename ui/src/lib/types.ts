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
}

export type { Leak, Comment };