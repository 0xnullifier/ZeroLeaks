interface Leak {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  tags: string[];
  content: string; // plain md to html
  proofAvailable: boolean;
  proofVerified: boolean;
  sourceEmail: string;
  originalEmail: string;
  relatedDocuments: {
    id: string;
    name: string;
  }[];
}

export type { Leak };