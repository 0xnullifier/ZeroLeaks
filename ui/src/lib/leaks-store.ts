import { create } from "zustand";
import type { Leak } from "./types";
import { LEAKS } from "./data/leaks";
import axios from "axios";
import { get as fetchBlobId } from "./walrus";
import { toast } from "sonner";

interface FilterState {
    searchQuery: string;
    selectedCategory: string;
    selectedTags: string[];
    dateFrom: string;
    dateTo: string;
}

interface LeaksStore {
    leaks: Leak[];
    loading: boolean;
    error: string | null;
    filters: FilterState;
    setLeaks: (leaks: Leak[]) => void;
    addLeak: (leak: Leak) => void;
    getLeakById: (id: string) => Leak | undefined;
    getCategories: () => string[];
    getAllTags: () => string[];
    getFilteredLeaks: () => Leak[];
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    toggleTag: (tag: string) => void;
    setDateRange: (from: string, to: string) => void;
    clearFilters: () => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    fetchLeaks: (data: any) => Promise<Leak[] | undefined>;
}

export const useLeaksStore = create<LeaksStore>((set, get) => ({
    leaks: [],
    loading: true,
    error: null,
    filters: {
        searchQuery: "",
        selectedCategory: "",
        selectedTags: [],
        dateFrom: "",
        dateTo: "",
    },

    setLeaks: (leaks: Leak[]) => set({
        leaks
    }),

    addLeak: (leak: Leak) => {
        set((state) => ({
            leaks: [...state.leaks, leak]
        }));
    },

    getLeakById: (id: string) => {
        const { leaks } = get();
        return leaks.find((leak) => leak.id === id);
    },

    getCategories: () => {
        const { leaks } = get();
        return Array.from(new Set(leaks.map((leak) => leak.category)));
    },

    getAllTags: () => {
        const { leaks } = get();
        return Array.from(new Set(leaks.flatMap((leak) => leak.tags)));
    },

    getFilteredLeaks: () => {
        const { leaks, filters } = get();
        let filteredLeaks = leaks;

        // Filter by search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredLeaks = filteredLeaks.filter((leak) =>
                leak.title.toLowerCase().includes(query) ||
                leak.summary.toLowerCase().includes(query) ||
                leak.content.toLowerCase().includes(query) ||
                leak.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filter by category
        if (filters.selectedCategory) {
            filteredLeaks = filteredLeaks.filter((leak) =>
                leak.category === filters.selectedCategory
            );
        }

        // Filter by tags
        if (filters.selectedTags.length > 0) {
            filteredLeaks = filteredLeaks.filter((leak) =>
                filters.selectedTags.some(tag => leak.tags.includes(tag))
            );
        }

        // Filter by date range
        if (filters.dateFrom || filters.dateTo) {
            filteredLeaks = filteredLeaks.filter((leak) => {
                const leakDate = new Date(leak.date);
                const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

                if (fromDate && leakDate < fromDate) return false;
                if (toDate && leakDate > toDate) return false;
                return true;
            });
        }

        return filteredLeaks;
    },

    setSearchQuery: (query: string) => {
        set((state) => ({
            filters: { ...state.filters, searchQuery: query }
        }));
    },

    setSelectedCategory: (category: string) => {
        set((state) => ({
            filters: { ...state.filters, selectedCategory: category }
        }));
    },

    toggleTag: (tag: string) => {
        set((state) => {
            const selectedTags = state.filters.selectedTags.includes(tag)
                ? state.filters.selectedTags.filter(t => t !== tag)
                : [...state.filters.selectedTags, tag];
            return {
                filters: { ...state.filters, selectedTags }
            };
        });
    },

    setDateRange: (from: string, to: string) => {
        set((state) => ({
            filters: { ...state.filters, dateFrom: from, dateTo: to }
        }));
    },

    clearFilters: () => {
        set((state) => ({
            filters: {
                searchQuery: "",
                selectedCategory: "",
                selectedTags: [],
                dateFrom: "",
                dateTo: "",
            }
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    setLoading: (loading: boolean) => set({ loading }),

    fetchLeaks: async (data: any) => {
        try {
            set({ loading: true, error: null });
            if (data?.data?.content) {
                // @ts-ignore
                const blobIds = data.data.content.fields.info.map((info: any) => info.fields.blob_id);
                // @ts-ignore
                const info = data.data.content.fields.info;

                // Create promises for blob content and transaction data
                const blobPromises = blobIds.map((blobId: string) => fetchBlobId(blobId));
                const transactionPromises = blobIds.map((blobId: string) =>
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leaks/submissions/${blobId}`)
                );

                // Use Promise.allSettled to handle individual failures gracefully
                const [blobResults, txResults] = await Promise.all([
                    Promise.allSettled(blobPromises),
                    Promise.allSettled(transactionPromises)
                ]);

                console.log('Blob results:', blobResults);
                console.log('Transaction results:', txResults);

                const leaks: Leak[] = [];
                let failedCount = 0;

                // Process each result individually
                for (let index = 0; index < blobIds.length; index++) {
                    const blobResult = blobResults[index];
                    const txResult = txResults[index];
                    try {
                        // Check if both blob and transaction fetch succeeded
                        if (blobResult.status === 'fulfilled' && txResult.status === 'fulfilled') {
                            const leak = JSON.parse(new TextDecoder().decode(blobResult.value));
                            console.log(txResult)
                            leaks.push({
                                id: blobIds[index],
                                date: leak.date,
                                title: leak.title,
                                category: leak.category,
                                tags: leak.tags,
                                summary: leak.summary,
                                content: leak.content,
                                fromLeakedEmail: leak.fromLeakedEmail || "nothingrn",
                                relatedDocuments: leak.documentFiles?.map((doc: any) => ({
                                    name: doc.name,
                                    content: doc.content, // blob id
                                })) || [],
                                verificationDigest: txResult.value.data.submission.transactionDigest,
                                proof: leak.zkProof,
                                verifiedClaim: info[index].fields.content || "cannot get the claim",
                            });
                        } else {
                            // Log individual failures for debugging
                            if (blobResult.status === 'rejected') {
                                console.error(`Failed to fetch blob ${blobIds[index]}:`, blobResult.reason);
                            }
                            if (txResult.status === 'rejected') {
                                console.error(`Failed to fetch transaction for ${blobIds[index]}:`, txResult.reason);
                            }
                            failedCount++;
                        }
                    } catch (parseError) {
                        console.error(`Error processing leak ${blobIds[index]}:`, parseError);
                        failedCount++;
                    }
                }

                set({ leaks: leaks.reverse(), loading: false });

                // Show a toast if some items failed but others succeeded
                if (failedCount > 0 && leaks.length > 0) {
                    toast(`${leaks.length} leaks loaded successfully. ${failedCount} items failed to load.`);
                } else if (failedCount > 0 && leaks.length === 0) {
                    toast("All leaks failed to load. Please try again later.");
                }

                return leaks
            }
        } catch (error) {
            console.error('Error in fetchLeaks:', error);
            toast("Error fetching the leaks. Please try again later");
        } finally {
            set({ loading: false });
        }
    },
}));

