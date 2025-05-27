import type { ProofResponseJSON } from "@/components/leaks/test";

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
}


export type { Leak };