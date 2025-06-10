import { create } from "zustand";
import type { Bounty, BountySubmission } from "./types";

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
    filters: BountyFilters;

    // Actions
    setBounties: (bounties: Bounty[]) => void;
    setLoading: (loading: boolean) => void;
    addBounty: (bounty: Bounty) => void;
    updateBounty: (id: string, updates: Partial<Bounty>) => void;
    getBountyById: (id: string) => Bounty | undefined;

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

    // Mock data
    initializeMockData: () => void;
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
    loading: false,
    filters: initialFilters,

    setBounties: (bounties) => set({ bounties }),
    setLoading: (loading) => set({ loading }),

    addBounty: (bounty) => set((state) => ({
        bounties: [bounty, ...state.bounties]
    })),

    updateBounty: (id, updates) => set((state) => ({
        bounties: state.bounties.map(bounty =>
            bounty.id === id ? { ...bounty, ...updates } : bounty
        )
    })),

    getBountyById: (id) => get().bounties.find(bounty => bounty.id === id),

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

        // Category filter
        if (filters.selectedCategories.length > 0) {
            filtered = filtered.filter(bounty =>
                filters.selectedCategories.includes(bounty.category)
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
        return Array.from(new Set(bounties.map(bounty => bounty.category)));
    },

    getAllTags: () => {
        const { bounties } = get();
        return Array.from(new Set(bounties.flatMap(bounty => bounty.tags)));
    },

    initializeMockData: () => {
        const mockBounties: Bounty[] = [
            {
                id: "1",
                title: "Pentagon UFO Files - Classified Evidence",
                description: "Seeking classified emails or documents regarding recent UFO encounters and military assessments. Must be verifiable through official channels.",
                category: "Military",
                tags: ["UFO", "classified", "pentagon", "military"],
                reward: 500,
                creator: "0x1234567890abcdef",
                status: "active",
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                requiredInfo: "Official emails or documents from Pentagon officials discussing UFO encounters, threat assessments, or investigation protocols.",
                verificationCriteria: "Documents must contain official letterhead, DKIM signatures, and reference specific incidents or policies.",
                submissions: [],
                submissionCount: 0,
            },
            {
                id: "2",
                title: "Big Tech Data Breach Cover-up",
                description: "Looking for internal communications about data breaches that were not disclosed to the public. Focus on major tech companies.",
                category: "Technology",
                tags: ["data breach", "tech", "privacy", "cover-up"],
                reward: 750,
                creator: "0xabcdef1234567890",
                status: "active",
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                requiredInfo: "Internal emails, incident reports, or communications discussing unreported data breaches or security vulnerabilities.",
                verificationCriteria: "Must include company domain, executive involvement, and specific breach details with timestamps.",
                submissions: [],
                submissionCount: 3,
            },
            {
                id: "3",
                title: "Pharmaceutical Price Fixing Scheme",
                description: "Seeking evidence of collusion between pharmaceutical companies to manipulate drug pricing.",
                category: "Healthcare",
                tags: ["pharmaceutical", "price fixing", "healthcare", "corruption"],
                reward: 1000,
                creator: "0x9876543210fedcba",
                status: "completed",
                deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                requiredInfo: "Communications between executives discussing pricing strategies, market manipulation, or coordination with competitors.",
                verificationCriteria: "Evidence must show direct coordination between multiple companies and impact on drug pricing.",
                submissions: [
                    {
                        id: "sub1",
                        bountyId: "3",
                        submitter: "0xfedcba9876543210",
                        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        zkProof: {} as any,
                        verificationDigest: "0x123abc456def",
                        status: "verified",
                        isWinner: true,
                    }
                ],
                submissionCount: 1,
            },
            {
                id: "4",
                title: "Climate Change Denial Funding",
                description: "Looking for evidence of fossil fuel companies funding climate change denial research or lobbying efforts.",
                category: "Environment",
                tags: ["climate change", "fossil fuels", "lobbying", "environment"],
                reward: 300,
                creator: "0x456789abcdef0123",
                status: "active",
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                requiredInfo: "Internal emails, funding documents, or communications showing deliberate misinformation campaigns.",
                verificationCriteria: "Must show direct funding connections and intent to spread misinformation about climate science.",
                submissions: [],
                submissionCount: 1,
            },
        ];

        set({ bounties: mockBounties });
    },
}));
