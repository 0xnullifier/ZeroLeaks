import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote, Users, DollarSign, AlertCircle } from "lucide-react";
import { CreateProposalDialog, ProposalCard, VotingStats, TokenBalance } from "@/components/dao";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { motion } from "framer-motion";

// Mock data for proposals
const mockProposals = [
    {
        id: "1",
        title: "Grant Access to Government Official - Department of Defense",
        description: "Proposal to grant decryption access to John Smith, Senior Analyst at the Department of Defense, for reviewing classified documents related to Project Alpha. Official verification documents and security clearance have been provided.",
        proposer: "0x1234...5678",
        status: "active" as const,
        votesFor: 1250,
        votesAgainst: 380,
        totalVotes: 1630,
        endTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        category: "access_grant",
        requiredVotes: 2000,
        officialInfo: {
            name: "John Smith",
            department: "Department of Defense",
            position: "Senior Intelligence Analyst",
            clearanceLevel: "Top Secret",
            requestedDocuments: ["Project Alpha - Phase 1", "Strategic Assessment Report"]
        }
    },
    {
        id: "2",
        title: "Grant Access to Whistleblower Protection Agency",
        description: "Request to provide document access to the Whistleblower Protection Agency for investigating potential misconduct cases. This proposal includes access to documents flagged for review.",
        proposer: "0x9876...5432",
        status: "passed" as const,
        votesFor: 2150,
        votesAgainst: 450,
        totalVotes: 2600,
        endTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        category: "access_grant",
        requiredVotes: 2000,
        officialInfo: {
            name: "Sarah Johnson",
            department: "Office of Special Counsel",
            position: "Whistleblower Protection Specialist",
            clearanceLevel: "Secret",
            requestedDocuments: ["Misconduct Report #2024-001", "Internal Audit Findings"]
        }
    },
    {
        id: "3",
        title: "Update DAO Governance Parameters",
        description: "Proposal to update the minimum voting threshold from 1000 to 1500 DAO tokens and extend voting period from 7 days to 10 days for better participation.",
        proposer: "0xabcd...efgh",
        status: "active" as const,
        votesFor: 890,
        votesAgainst: 1200,
        totalVotes: 2090,
        endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        category: "governance",
        requiredVotes: 2000
    },
    {
        id: "4",
        title: "Grant Access to Congressional Committee",
        description: "Request from the House Intelligence Committee to access documents related to national security oversight. Committee chair has provided official authorization.",
        proposer: "0xdef0...1234",
        status: "rejected" as const,
        votesFor: 750,
        votesAgainst: 1890,
        totalVotes: 2640,
        endTime: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        category: "access_grant",
        requiredVotes: 2000,
        officialInfo: {
            name: "Rep. Michael Davis",
            department: "House Intelligence Committee",
            position: "Committee Chair",
            clearanceLevel: "Top Secret/SCI",
            requestedDocuments: ["National Security Briefing Materials", "Intelligence Assessment Reports"]
        }
    }
];

export type ProposalStatus = "active" | "passed" | "rejected" | "pending";

export interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    status: ProposalStatus;
    votesFor: number;
    votesAgainst: number;
    totalVotes: number;
    endTime: number;
    createdAt: number;
    category: string;
    requiredVotes: number;
    officialInfo?: {
        name: string;
        department: string;
        position: string;
        clearanceLevel: string;
        requestedDocuments: string[];
    };
}

export function DAOPage() {
    const currentAccount = useCurrentAccount();
    const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
    const [activeTab, setActiveTab] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [userTokenBalance] = useState(1500); // Mock user token balance

    const filteredProposals = proposals.filter(proposal => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return proposal.status === "active";
        if (activeTab === "access") return proposal.category === "access_grant";
        if (activeTab === "governance") return proposal.category === "governance";
        return true;
    });

    const handleVote = (proposalId: string, vote: "for" | "against", tokenAmount: number) => {
        setProposals(prev => prev.map(proposal => {
            if (proposal.id === proposalId) {
                const newVotesFor = vote === "for" ? proposal.votesFor + tokenAmount : proposal.votesFor;
                const newVotesAgainst = vote === "against" ? proposal.votesAgainst + tokenAmount : proposal.votesAgainst;
                return {
                    ...proposal,
                    votesFor: newVotesFor,
                    votesAgainst: newVotesAgainst,
                    totalVotes: newVotesFor + newVotesAgainst
                };
            }
            return proposal;
        }));
    };

    const handleCreateProposal = (newProposal: Omit<Proposal, "id" | "votesFor" | "votesAgainst" | "totalVotes" | "createdAt">) => {
        const proposal: Proposal = {
            ...newProposal,
            id: Date.now().toString(),
            votesFor: 0,
            votesAgainst: 0,
            totalVotes: 0,
            createdAt: Date.now()
        };
        setProposals(prev => [proposal, ...prev]);
    };

    const activeProposals = proposals.filter(p => p.status === "active").length;
    const totalProposals = proposals.length;
    const totalVotes = proposals.reduce((sum, p) => sum + p.totalVotes, 0);

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Header with prominent Create Proposal button */}
                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                ZeroLeaks DAO
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-3xl">
                                Decentralized governance for document access control. Token holders vote on proposals to grant government officials and oversight bodies access to decrypt sensitive documents.
                            </p>
                        </div>

                        {/* Prominent Create Proposal Button */}
                        {currentAccount && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    size="lg"
                                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create New Proposal
                                </Button>
                            </motion.div>
                        )}

                        {/* Call to action for non-connected users */}
                        {!currentAccount && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-medium">Connect your wallet to create proposals and vote</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                                <Vote className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeProposals}</div>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Currently voting</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                                <Users className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{totalProposals}</div>
                                <p className="text-xs text-green-600 dark:text-green-400">All time</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
                                <DollarSign className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalVotes.toLocaleString()}</div>
                                <p className="text-xs text-purple-600 dark:text-purple-400">DAO tokens</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <TokenBalance balance={userTokenBalance} />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold">Proposals</h2>
                                {currentAccount && (
                                    <Button
                                        onClick={() => setIsCreateDialogOpen(true)}
                                        variant="outline"
                                        className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Proposal
                                    </Button>
                                )}
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 mb-6">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="access">Access Grants</TabsTrigger>
                                    <TabsTrigger value="governance">Governance</TabsTrigger>
                                </TabsList>

                                <TabsContent value={activeTab} className="space-y-6">
                                    {filteredProposals.length === 0 ? (
                                        <Card>
                                            <CardContent className="pt-6 text-center">
                                                <p className="text-muted-foreground">No proposals found.</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        filteredProposals.map((proposal, index) => (
                                            <motion.div
                                                key={proposal.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                            >
                                                <ProposalCard
                                                    proposal={proposal}
                                                    onVote={handleVote}
                                                    userTokenBalance={userTokenBalance}
                                                />
                                            </motion.div>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="space-y-6"
                        >
                            <VotingStats proposals={proposals} />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                        How It Works
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-medium mb-2">1. Proposal Creation</h4>
                                        <p className="text-muted-foreground">Government officials or community members create proposals to access encrypted documents.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">2. Community Voting</h4>
                                        <p className="text-muted-foreground">DAO token holders vote using their tokens to approve or reject access requests.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">3. Automatic Execution</h4>
                                        <p className="text-muted-foreground">Approved proposals automatically grant decryption access to authorized officials.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Proposal Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-sm">Active - Currently voting</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-sm">Passed - Access granted</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-sm">Rejected - Access denied</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Create Proposal Dialog */}
                <CreateProposalDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    onCreateProposal={handleCreateProposal}
                />
            </main>
        </div>
    );
}
