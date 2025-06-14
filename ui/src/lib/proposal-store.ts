import { create } from "zustand";
import type { Proposal as ContractProposal } from "./types";
import { toast } from "sonner";
import { COIN_DECIMAL } from "./constant";
import { useBountyStore } from "./bounty-store";

// Extended proposal interface for UI with additional fields
export interface UIProposal extends ContractProposal {
    title: string;
    category: string;
    votesFor: number;
    votesAgainst: number;
    totalVotes: number;
    endTime: number;
    proposer?: string; // wallet address of the proposer
    officialInfo?: {
        name: string;
        department: string;
        position: string;
        requestedDocuments: string[];
    };
    // For BountyAction proposals
    bountyInfo?: {
        bountyId: string;
        bountyTitle: string;
        submissionCount: number;
        selectedSubmissionIdx?: number; // which submission is being voted on
    };
}

interface FilterState {
    searchQuery: string;
    selectedCategory: string;
    selectedStatus: string;
    dateFrom: string;
    dateTo: string;
}

interface ProposalStore {
    proposals: UIProposal[];
    loading: boolean;
    error: string | null;
    filters: FilterState;
    setProposals: (proposals: UIProposal[]) => void;
    addProposal: (proposal: UIProposal) => void;
    updateProposal: (id: string, updates: Partial<UIProposal>) => void;
    getProposalById: (id: string) => UIProposal | undefined;
    getCategories: () => string[];
    getStatuses: () => string[];
    getFilteredProposals: () => UIProposal[];
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    setSelectedStatus: (status: string) => void;
    setDateRange: (from: string, to: string) => void;
    clearFilters: () => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    fetchProposals: (data: any) => Promise<UIProposal[] | undefined>;
    voteOnProposal: (proposalId: string, vote: "for" | "against", tokenAmount: number) => void;
    getActiveProposals: () => UIProposal[];
    getTotalVotesCast: () => number;
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
    proposals: [],
    loading: true,
    error: null,
    filters: {
        searchQuery: "",
        selectedCategory: "",
        selectedStatus: "",
        dateFrom: "",
        dateTo: "",
    },

    setProposals: (proposals: UIProposal[]) => set({ proposals }),

    addProposal: (proposal: UIProposal) => {
        set((state) => ({
            proposals: [proposal, ...state.proposals]
        }));
    },

    updateProposal: (id: string, updates: Partial<UIProposal>) => {
        set((state) => ({
            proposals: state.proposals.map(proposal =>
                proposal.id === id ? { ...proposal, ...updates } : proposal
            )
        }));
    },

    getProposalById: (id: string) => {
        const { proposals } = get();
        return proposals.find((proposal) => proposal.id === id);
    },

    getCategories: () => {
        const { proposals } = get();
        return Array.from(new Set(proposals.map((proposal) => proposal.category)));
    },

    getStatuses: () => {
        const { proposals } = get();
        return Array.from(new Set(proposals.map((proposal) => proposal.status)));
    },

    getFilteredProposals: () => {
        const { proposals, filters } = get();
        let filteredProposals = proposals;

        // Filter by search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredProposals = filteredProposals.filter((proposal) =>
                proposal.title.toLowerCase().includes(query) ||
                proposal.description.toLowerCase().includes(query) ||
                proposal.officialInfo?.name.toLowerCase().includes(query) ||
                proposal.officialInfo?.department.toLowerCase().includes(query) ||
                proposal.bountyInfo?.bountyTitle.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (filters.selectedCategory) {
            filteredProposals = filteredProposals.filter((proposal) =>
                proposal.category === filters.selectedCategory
            );
        }

        // Filter by status
        if (filters.selectedStatus) {
            filteredProposals = filteredProposals.filter((proposal) =>
                proposal.status === filters.selectedStatus
            );
        }

        // Filter by date range
        if (filters.dateFrom || filters.dateTo) {
            filteredProposals = filteredProposals.filter((proposal) => {
                const proposalDate = new Date(proposal.createdAt || 0);
                const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

                if (fromDate && proposalDate < fromDate) return false;
                if (toDate && proposalDate > toDate) return false;
                return true;
            });
        }

        return filteredProposals;
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

    setSelectedStatus: (status: string) => {
        set((state) => ({
            filters: { ...state.filters, selectedStatus: status }
        }));
    },

    setDateRange: (from: string, to: string) => {
        set((state) => ({
            filters: { ...state.filters, dateFrom: from, dateTo: to }
        }));
    },

    clearFilters: () => {
        set(() => ({
            filters: {
                searchQuery: "",
                selectedCategory: "",
                selectedStatus: "",
                dateFrom: "",
                dateTo: "",
            }
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    setLoading: (loading: boolean) => set({ loading }),

    fetchProposals: async (data: any) => {
        try {
            set({ loading: true, error: null });

            if (data?.data?.content && 'fields' in data.data.content) {
                const fields = data.data.content.fields as any;

                if (fields.proposals) {
                    // Get bounty store instance to fetch bounty data
                    const bountyStore = useBountyStore.getState();

                    // Convert contract proposals to UI format
                    const contractProposals: UIProposal[] = fields.proposals.map((p: any, index: number) => {
                        const proposalFields = p.fields;

                        // Map contract action to UI category
                        const getCategoryFromAction = (action: string) => {
                            switch (action) {
                                case "AddAddressToAllowlist":
                                    return "access_grant";
                                case "BountyAction":
                                    return "bounty_action";
                                case "GovernanceAction":
                                    return "governance";
                                default:
                                    return "other";
                            }
                        };
                        console.log("Proposal Fields", proposalFields.for_vote);


                        // Calculate vote totals
                        const forVoteWeight = proposalFields.for_vote.map((v: any) => v.fields.weight).reduce((sum: number, amount: number) => sum + amount, 0);
                        const againstVoteWeight = proposalFields.angaist_vote.map((v: any) => v.fields.weight).reduce((sum: number, amount: number) => sum + amount, 0);
                        let normalizedForVotes = forVoteWeight / Math.sqrt(COIN_DECIMAL);
                        let normalizedAgainstVotes = againstVoteWeight / Math.sqrt(COIN_DECIMAL);
                        let normalizedTotalVotes = normalizedForVotes + normalizedAgainstVotes;
                        if (proposalFields.action.variant === "BountyAction") {
                            // the votes for this case are in bounty submissions
                            const bountyIdx = proposalFields.action.fields.pos0;
                            const bounty = bountyStore.getBountyById(bountyIdx.toString());
                            if (bounty) {
                                const submissionVotes = bounty.submissions.reduce((acc: { for: number, against: number }, submission) => {
                                    acc.for += submission.votes
                                    return acc;
                                }, { for: 0, against: 0 });
                                normalizedForVotes += submissionVotes.for / COIN_DECIMAL;
                                normalizedTotalVotes += normalizedForVotes + normalizedAgainstVotes;
                            }
                        }
                        console.log("Normalized Votes", {
                            forVotes: normalizedForVotes,
                            againstVotes: normalizedAgainstVotes,
                            totalVotes: normalizedTotalVotes,
                        });

                        return {
                            id: index.toString(),
                            title: proposalFields.title,
                            description: proposalFields.description,
                            action: proposalFields.action.variant as "AddAddressToAllowlist" | "BountyAction",
                            allowlistIdx: proposalFields.action.variant === "AddAddressToAllowlist" ? proposalFields.action.fields.pos0 : undefined,
                            bountyIdx: proposalFields.action.variant === "BountyAction" ? proposalFields.action.fields.pos0 : undefined,
                            targetAddress: proposalFields.proposar,
                            proposalInfo: (proposalFields.action.variant === "AddAddressToAllowlist" && proposalFields.action.fields.pos2?.fields) ? {
                                name: proposalFields.action.fields.pos2.fields.name,
                                agency: proposalFields.action.fields.pos2.fields.agency,
                                position: proposalFields.action.fields.pos2.fields.position,
                            } : undefined,
                            status: proposalFields.status.variant as "InProgress" | "Passed" | "Rejected",
                            deadline: parseInt(proposalFields.deadline),
                            forVotes: proposalFields.for_vote.length || 0,
                            againstVotes: proposalFields.angaist_vote.length || 0,
                            category: getCategoryFromAction(proposalFields.action.variant),
                            votesFor: normalizedForVotes,
                            votesAgainst: normalizedAgainstVotes,
                            totalVotes: normalizedTotalVotes,
                            endTime: parseInt(proposalFields.deadline),
                            createdAt: new Date(Number(proposalFields.start_at)),
                            officialInfo: (proposalFields.action.variant === "AddAddressToAllowlist" && proposalFields.action.fields.pos2?.fields) ? {
                                name: proposalFields.action.fields.pos2.fields.name,
                                department: proposalFields.action.fields.pos2.fields.agency,
                                position: proposalFields.action.fields.pos2.fields.position,
                                requestedDocuments: [], // This would need to be populated from contract data
                            } : undefined,
                            // Fetch actual bounty info for BountyAction proposals
                            bountyInfo: proposalFields.action.variant === "BountyAction" ? (() => {
                                const bountyIdx = proposalFields.action.fields.pos0;
                                console.log("Bounty Index", bountyIdx);
                                const bounty = bountyStore.getBountyById(bountyIdx.toString());
                                console.log("Bounty Info", bounty);
                                if (bounty) {
                                    return {
                                        bountyId: bounty.id,
                                        bountyTitle: bounty.title,
                                        submissionCount: bounty.submissionCount || 0,
                                        selectedSubmissionIdx: 0, // This would be determined during voting
                                    };
                                }
                                // Fallback if bounty not found
                                return {
                                    bountyId: bountyIdx?.toString() || "0",
                                    bountyTitle: `Bounty #${bountyIdx || "0"}`,
                                    submissionCount: 0,
                                    selectedSubmissionIdx: 0,
                                };
                            })() : undefined,
                        };
                    });
                    console.log(contractProposals)
                    set({ proposals: contractProposals, loading: false });
                    return contractProposals;
                }
            }

            // If no data, set empty array
            set({ proposals: [], loading: false });
            return [];
        } catch (error) {
            console.error('Error in fetchProposals:', error);
            set({ error: 'Failed to fetch proposals', loading: false });
            toast.error("Error fetching proposals. Please try again later");
            return undefined;
        }
    },

    voteOnProposal: (proposalId: string, vote: "for" | "against", tokenAmount: number) => {
        set((state) => ({
            proposals: state.proposals.map(proposal => {
                if (proposal.id === proposalId) {
                    const newVotesFor = vote === "for" ? proposal.votesFor + tokenAmount : proposal.votesFor;
                    const newVotesAgainst = vote === "against" ? proposal.votesAgainst + tokenAmount : proposal.votesAgainst;
                    return {
                        ...proposal,
                        votesFor: newVotesFor,
                        votesAgainst: newVotesAgainst,
                        totalVotes: newVotesFor + newVotesAgainst,
                        forVotes: newVotesFor,
                        againstVotes: newVotesAgainst,
                    };
                }
                return proposal;
            })
        }));
    },

    getActiveProposals: () => {
        const { proposals } = get();
        console.log(proposals)
        return proposals.filter(p => p.status === "InProgress");
    },

    getTotalVotesCast: () => {
        const { proposals } = get();
        return proposals.reduce((sum, p) => sum + p.totalVotes, 0);
    },
}));
