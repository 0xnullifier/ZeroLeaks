import { create } from "zustand";
import type { Leak } from "./types";
import { LEAKS } from "./data/leaks";

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
}

export const useLeaksStore = create<LeaksStore>((set, get) => ({
    leaks: LEAKS,
    loading: false,
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
}));
