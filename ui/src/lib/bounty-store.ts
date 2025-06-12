import { create } from "zustand";
import type { Bounty, BountySubmission } from "./types";
import { toast } from "sonner";
import { COIN_DECIMAL } from "./constant";

interface BountyFilters {
    searchQuery: string;
    selectedCategories: string[];
    selectedTags: string[];
    status: string[];
    minReward: number;
    maxReward: number;
    sortBy: "newest" | "oldest" | "reward_high" | "reward_low" | "deadline";
}

interface BountyStore {
    bounties: Bounty[];
    loading: boolean;
    error: string | null;
    filters: BountyFilters;

    // Actions
    setBounties: (bounties: Bounty[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    addBounty: (bounty: Bounty) => void;
    updateBounty: (id: string, updates: Partial<Bounty>) => void;
    getBountyById: (id: string) => Bounty | undefined;

    // Data fetching
    fetchBounties: (data: any) => Promise<Bounty[] | undefined>;

    // Filter actions
    setSearchQuery: (query: string) => void;
    toggleCategory: (category: string) => void;
    toggleTag: (tag: string) => void;
    toggleStatus: (status: string) => void;
    setRewardRange: (min: number, max: number) => void;
    setSortBy: (sortBy: BountyFilters["sortBy"]) => void;
    clearFilters: () => void;

    // Getters
    getFilteredBounties: () => Bounty[];
    getCategories: () => string[];
    getAllTags: () => string[];
    getActiveBounties: () => Bounty[];
}

const initialFilters: BountyFilters = {
    searchQuery: "",
    selectedCategories: [],
    selectedTags: [],
    status: [],
    minReward: 0,
    maxReward: 1000,
    sortBy: "newest",
};

export const useBountyStore = create<BountyStore>((set, get) => ({
    bounties: [],
    loading: true,
    error: null,
    filters: initialFilters,

    setBounties: (bounties) => set({ bounties }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    addBounty: (bounty) => set((state) => ({
        bounties: [bounty, ...state.bounties]
    })),

    updateBounty: (id, updates) => set((state) => ({
        bounties: state.bounties.map(bounty =>
            bounty.id === id ? { ...bounty, ...updates } : bounty
        )
    })),

    getBountyById: (id) => get().bounties.find(bounty => bounty.id === id),

    fetchBounties: async (data: any) => {
        try {
            set({ loading: true, error: null });
            console.log("here")
            if (data?.data?.content && 'fields' in data.data.content) {
                const fields = data.data.content.fields as any;

                if (fields.bounties) {
                    // Convert contract bounties to UI format
                    const contractBounties: Bounty[] = fields.bounties.map((b: any, index: number) => {
                        const bountyFields = b.fields;
                        console.log("bountyfields", bountyFields)

                        // Parse submissions if they exist
                        const submissions: BountySubmission[] = bountyFields.submissions?.map((sub: any) => ({
                            proofPointsBytes: sub.fields.proof_points_bytes,
                            publicInputs: sub.fields.public_inputs,
                            by: sub.fields.by,
                            content: sub.fields.content,
                            creator: sub.fields.creator,
                            votes: sub.fields.votes,
                            article: sub.fields.detailed_article
                        })) || [];

                        return {
                            id: index.toString(),
                            title: bountyFields.title,
                            description: bountyFields.description,
                            category: bountyFields.category,
                            tags: bountyFields.tags,
                            reward: bountyFields.amount ? bountyFields.amount / COIN_DECIMAL : 0,
                            creator: bountyFields.creator || "",
                            status: bountyFields.status?.variant,
                            deadline: parseInt(bountyFields.deadline),
                            createdAt: parseInt(bountyFields.created_at),
                            numberOfRewards: parseInt(bountyFields.numberOfRewards),
                            vkBytes: bountyFields.vk_bytes || "",
                            requiredInfo: bountyFields.required_information || "",
                            verificationCriteria: bountyFields.verification_criteria || "",
                            submissions,
                            submissionCount: submissions.length,
                        };
                    });

                    console.log("Parsed bounties:", contractBounties);
                    set({ bounties: contractBounties, loading: false });
                    return contractBounties;
                }
            }

            // If no data, set empty array
            set({ bounties: [], loading: false });
            return [];
        } catch (error) {
            console.error('Error in fetchBounties:', error);
            set({ error: 'Failed to fetch bounties', loading: false });
            toast.error("Error fetching bounties. Please try again later");
            return undefined;
        }
    },

    // Filter actions
    setSearchQuery: (query) => set((state) => ({
        filters: { ...state.filters, searchQuery: query }
    })),

    toggleCategory: (category) => set((state) => ({
        filters: {
            ...state.filters,
            selectedCategories: state.filters.selectedCategories.includes(category)
                ? state.filters.selectedCategories.filter(c => c !== category)
                : [...state.filters.selectedCategories, category]
        }
    })),

    toggleTag: (tag) => set((state) => ({
        filters: {
            ...state.filters,
            selectedTags: state.filters.selectedTags.includes(tag)
                ? state.filters.selectedTags.filter(t => t !== tag)
                : [...state.filters.selectedTags, tag]
        }
    })),

    toggleStatus: (status) => set((state) => ({
        filters: {
            ...state.filters,
            status: state.filters.status.includes(status)
                ? state.filters.status.filter(s => s !== status)
                : [...state.filters.status, status]
        }
    })),

    setRewardRange: (min, max) => set((state) => ({
        filters: { ...state.filters, minReward: min, maxReward: max }
    })),

    setSortBy: (sortBy) => set((state) => ({
        filters: { ...state.filters, sortBy }
    })),

    clearFilters: () => set({ filters: initialFilters }),

    // Getters
    getFilteredBounties: () => {
        const { bounties, filters } = get();
        let filtered = bounties;

        // Search filter
        if (filters.searchQuery) {
            filtered = filtered.filter(bounty =>
                bounty.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                bounty.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                bounty.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
            );
        }

        // Category filter - handle array of categories
        if (filters.selectedCategories.length > 0) {
            filtered = filtered.filter(bounty =>
                filters.selectedCategories.some(selectedCategory =>
                    bounty.category.includes(selectedCategory)
                )
            );
        }

        // Tag filter
        if (filters.selectedTags.length > 0) {
            filtered = filtered.filter(bounty =>
                filters.selectedTags.some(tag => bounty.tags.includes(tag))
            );
        }

        // Status filter
        if (filters.status.length > 0) {
            filtered = filtered.filter(bounty =>
                filters.status.includes(bounty.status)
            );
        }

        // Reward range filter
        filtered = filtered.filter(bounty =>
            bounty.reward >= filters.minReward && bounty.reward <= filters.maxReward
        );

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (filters.sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "reward_high":
                    return b.reward - a.reward;
                case "reward_low":
                    return a.reward - b.reward;
                case "deadline":
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                default:
                    return 0;
            }
        });

        return sorted;
    },

    getCategories: () => {
        const { bounties } = get();
        return Array.from(new Set(bounties.flatMap(bounty => bounty.category)));
    },

    getAllTags: () => {
        const { bounties } = get();
        return Array.from(new Set(bounties.flatMap(bounty => bounty.tags)));
    },

    getActiveBounties: () => {
        const { bounties } = get();
        return bounties.filter(bounty => bounty.status === "Open");
    },
}));
