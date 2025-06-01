import type { ProofResponseJSON } from "@/components/leaks/email_info";
import { create } from "zustand";

interface SubmitLeakStore {
  emlFile: File | null;
  emailContent: string;
  documentFiles: File[];
  documentEncryptionSettings: { [fileName: string]: boolean };
  title: string;
  summary: string;
  category: string;
  content: string;
  tags: string[];
  zkProof: ProofResponseJSON | null;
  transactionDigest: string
  setEmlFile: (file: File) => void;
  setEmailContent: (content: string) => void;
  setDocumentFiles: (files: File[]) => void;
  setDocumentEncryption: (fileName: string, encrypt: boolean) => void;
  setTitle: (title: string) => void;
  setSummary: (summary: string) => void;
  setTags: (tags: string[]) => void;
  setCategory: (category: string) => void;
  setContent: (content: string) => void;
  setZkProof: (proof: ProofResponseJSON) => void;
  setTransactionDigest: (transactionDigest: string) => void;
}

export const useSubmitLeakStore = create<SubmitLeakStore>((set) => ({
  emlFile: null,
  emailContent: "",
  documentFiles: [],
  documentEncryptionSettings: {},
  title: "",
  summary: "",
  category: "",
  content: "",
  tags: [],
  transactionDigest: "",
  zkProof: null,
  setEmlFile: (file: File) => set({ emlFile: file }),
  setEmailContent: (content: string) => set({ emailContent: content }),
  setDocumentFiles: (files: File[]) => set({ documentFiles: files }),
  setDocumentEncryption: (fileName: string, encrypt: boolean) =>
    set((state) => ({
      documentEncryptionSettings: {
        ...state.documentEncryptionSettings,
        [fileName]: encrypt
      }
    })),
  setTitle: (title: string) => set({ title: title }),
  setSummary: (summary: string) => set({ summary: summary }),
  setTags: (tags: string[]) => set({ tags: tags }),
  setCategory: (category: string) => set({ category: category }),
  setContent: (content: string) => set({ content: content }),
  setZkProof: (proof: ProofResponseJSON) => set({ zkProof: proof }),
  setTransactionDigest: (transactionDigest: string) => set({ transactionDigest })
}));