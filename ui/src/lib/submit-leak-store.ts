import { create } from "zustand";

interface SubmitLeakStore {
  emlFile: File | null;
  emailContent: string;
  documentFiles: File[];
  documentDescription: string;
  title: string;
  summary: string;
  category: string;
  content: string;
  tags: string[];
  zkProof: string | null;
  setEmlFile: (file: File) => void;
  setEmailContent: (content: string) => void;
  setDocumentFiles: (files: File[]) => void;
  setDocumentDescription: (description: string) => void;
  setTitle: (title: string) => void;
  setSummary: (summary: string) => void;
  setTags: (tags: string[]) => void;
  setCategory: (category: string) => void;
  setContent: (content: string) => void;
  setZkProof: (proof: string) => void;
}

export const useSubmitLeakStore = create<SubmitLeakStore>((set) => ({
  emlFile: null,
  emailContent: "",
  documentFiles: [],
  documentDescription: "",
  title: "",
  summary: "",
  category: "",
  content: "",
  tags: [],
  zkProof: null,
  setEmlFile: (file: File) => set({ emlFile: file }),
  setEmailContent: (content: string) => set({ emailContent: content }),
  setDocumentFiles: (files: File[]) => set({ documentFiles: files }),
  setDocumentDescription: (description: string) => set({ documentDescription: description }),
  setTitle: (title: string) => set({ title: title }),
  setSummary: (summary: string) => set({ summary: summary }),
  setTags: (tags: string[]) => set({ tags: tags }),
  setCategory: (category: string) => set({ category: category }),
  setContent: (content: string) => set({ content: content }),
  setZkProof: (proof: string) => set({ zkProof: proof }),
}));