import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Vote, Users, DollarSign, Coins, Loader2 } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, DAO_OBJECT_ID, BOUNTIES_OBJECT_ID, LEAKS_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner";
import { useLeaksStore } from "@/lib/leaks-store";
import { useBountyStore } from "@/lib/bounty-store";

// Contract-aligned proposal interface
interface UIProposal {
    id: string;
    title: string;
    description: string;
    action: "AddAddressToAllowlist";
    allowlistIdx?: number;
    targetAddress?: string;
    proposalInfo?: {
        name: string;
        agency: string;
        position: string;
    };
    status: "InProgress" | "Tally" | "Ended";
    deadline: number;
    forVotes: number;
    againstVotes: number;
    creator?: string;
    createdAt?: number;
}

export function DAOPage() {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    // Use stores for leaks and bounties data
    const { leaks, fetchLeaks } = useLeaksStore();
    const { bounties } = useBountyStore();

    const [proposals, setProposals] = useState<UIProposal[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);
    const [mintAmount, setMintAmount] = useState("1000");
    const [isLoading, setIsLoading] = useState(false);

    // Create proposal form state
    const [newProposal, setNewProposal] = useState({
        type: "", // "AddAddressToAllowlist" or "StartBountyTally"
        title: "",
        description: "",
        allowlistIdx: "0",
        bountyIdx: "0",
        proposalInfo: {
            name: "",
            agency: "",
            position: ""
        }
    });

    // Fetch ZL_DAO token balance
    const { data: zlTokenBalance, refetch: refetchBalance } = useSuiClientQuery(
        "getBalance",
        {
            owner: currentAccount?.address!,
            coinType: `${PACKAGE_ID}::zl_dao::ZL_DAO`,
        },
        {
            enabled: !!currentAccount?.address,
        }
    );

    // Fetch DAO object data
    const { data: daoData, refetch: refetchDao } = useSuiClientQuery(
        "getObject",
        {
            id: DAO_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        },
        {
            enabled: !!DAO_OBJECT_ID,
        }
    );

    const { data: leaksData } = useSuiClientQuery(
        "getObject",
        {
            id: LEAKS_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        }
    );

    console.log(daoData)

    useEffect(() => {
        if (leaks.length === 0 && leaksData) {
            fetchLeaks(leaksData);
        }
    }, [leaksData, leaks.length, fetchLeaks]);

    useEffect(() => {

        if (daoData?.data?.content && 'fields' in daoData.data.content) {
            const fields = daoData.data.content.fields as any;
            if (fields.proposals) {
                // Convert contract proposals to UI format
                const contractProposals = fields.proposals.map((_p: any, index: number) => {
                    const p = _p.fields;
                    return {
                        id: index.toString(),
                        title: `Proposal ${index + 1}`,
                        description: p.description || "No description provided",
                        action: "AddAddressToAllowlist" as const,
                        status: p.status.variant as "InProgress" | "Tally" | "Ended",
                        deadline: p.deadline ? parseInt(p.deadline) : Date.now() + 7 * 24 * 60 * 60 * 1000,
                        forVotes: p.for_vote?.length || 0,
                        againstVotes: p.angaist_vote?.length || 0,
                        createdAt: Date.now(),
                    }
                });
                setProposals(contractProposals);
            }
        }
    }, [daoData]);

    const userTokenBalance = zlTokenBalance ? parseInt(zlTokenBalance.totalBalance) / 1000000000 : 0;

    const filteredProposals = proposals.filter(proposal => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return proposal.status === "InProgress";
        if (activeTab === "access") return proposal.action === "AddAddressToAllowlist";
        return true;
    });

    const handleMintTokens = async () => {
        if (!currentAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsLoading(true);
        try {
            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::zl_dao::mint_test`,
                arguments: [
                    tx.object(DAO_OBJECT_ID),
                    tx.pure.u64(parseInt(mintAmount) * 1000000000), // Convert to smallest unit
                    tx.pure.address(currentAccount.address),
                ],
            });

            tx.setGasBudget(10000000);
            const { digest } = await signAndExecuteTransaction({
                transaction: tx,
            });

            toast.success("Tokens minted successfully!", {
                action: {
                    label: "View Transaction",
                    onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
                },
            });

            // Refetch balance
            await refetchBalance();
            setMintAmount("1000");
            setIsMintDialogOpen(false);
        } catch (error: any) {
            console.error("Error minting tokens:", error);
            toast.error(error?.message || "Failed to mint tokens");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProposal = async () => {
        if (!currentAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!newProposal.type || !newProposal.title || !newProposal.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const tx = new Transaction();

            if (newProposal.type === "AddAddressToAllowlist") {
                // Create proposal for adding address to allowlist
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_add_allowlist_proposal`,
                    arguments: [
                        tx.pure.string(newProposal.proposalInfo.name),
                        tx.pure.string(newProposal.proposalInfo.agency),
                        tx.pure.string(newProposal.proposalInfo.position),
                        tx.pure.u64(parseInt(newProposal.allowlistIdx)),
                        tx.pure.string(newProposal.description),
                        tx.object("0x6"), // Clock object
                        tx.object(DAO_OBJECT_ID),
                    ],
                });
            } else if (newProposal.type === "StartBountyTally") {
                // Create proposal for starting bounty tally
                tx.moveCall({
                    target: `${PACKAGE_ID}::bounties::start_tally`,
                    arguments: [
                        tx.pure.u64(parseInt(newProposal.bountyIdx)),
                        tx.object("0x6"), // Clock object
                        tx.object(BOUNTIES_OBJECT_ID),
                    ],
                });
            }

            tx.setGasBudget(10000000);
            const { digest } = await signAndExecuteTransaction({
                transaction: tx,
            });

            toast.success("Proposal created successfully!", {
                action: {
                    label: "View Transaction",
                    onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
                },
            });

            // Reset form and close dialog
            setNewProposal({
                type: "",
                title: "",
                description: "",
                allowlistIdx: "0",
                bountyIdx: "0",
                proposalInfo: {
                    name: "",
                    agency: "",
                    position: ""
                }
            });
            setIsCreateDialogOpen(false);

            // Refetch DAO data
            await refetchDao();
        } catch (error: any) {
            console.error("Error creating proposal:", error);
            toast.error(error?.message || "Failed to create proposal");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (proposalId: string, vote: "for" | "against", tokenAmount: number) => {
        if (!currentAccount) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsLoading(true);
        try {
            const tx = new Transaction();

            // First, split the required amount from user's ZL tokens
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(tokenAmount * 1000000000)]);

            tx.moveCall({
                target: `${PACKAGE_ID}::zl_dao::vote`,
                arguments: [
                    tx.pure.u64(parseInt(proposalId)),
                    tx.pure.u64(tokenAmount * 1000000000),
                    coin,
                    tx.pure.bool(vote === "for"),
                    tx.object(DAO_OBJECT_ID),
                ],
            });

            tx.setGasBudget(20000000);
            const { digest } = await signAndExecuteTransaction({
                transaction: tx,
            });

            toast.success(`Vote cast successfully!`, {
                action: {
                    label: "View Transaction",
                    onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
                },
            });

            // Refetch DAO data and balance
            await Promise.all([refetchDao(), refetchBalance()]);
        } catch (error: any) {
            console.error("Error voting:", error);
            toast.error(error?.message || "Failed to cast vote");
        } finally {
            setIsLoading(false);
        }
    };

    const activeProposals = proposals.filter(p => p.status === "InProgress").length;
    const totalProposals = proposals.length;
    const totalVotes = proposals.reduce((sum, p) => sum + p.forVotes + p.againstVotes, 0);

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
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
                                Decentralized governance for document access control. Token holders vote on proposals to grant access to encrypted documents.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {currentAccount && (
                                <>
                                    <Button
                                        onClick={() => setIsMintDialogOpen(true)}
                                        variant="outline"
                                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                    >
                                        <Coins className="h-4 w-4 mr-2" />
                                        Mint Tokens
                                    </Button>
                                    <Button
                                        onClick={() => setIsCreateDialogOpen(true)}
                                        size="lg"
                                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create Proposal
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-300 dark:border-blue-700 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-200">Active Proposals</CardTitle>
                            <Vote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeProposals}</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Currently voting</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950/30 dark:to-green-900/30 border-green-300 dark:border-green-700 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-200">Total Proposals</CardTitle>
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{totalProposals}</div>
                            <p className="text-xs text-green-600 dark:text-green-400">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-300 dark:border-purple-700 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-200">Total Votes Cast</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalVotes}</div>
                            <p className="text-xs text-purple-600 dark:text-purple-400">DAO tokens</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30 border-amber-300 dark:border-amber-700 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-200">Your Balance</CardTitle>
                            <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                {userTokenBalance.toFixed(1)}
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400">ZL tokens</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Proposals Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Proposals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="access">Access Grants</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="space-y-4">
                                {filteredProposals.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No proposals found.</p>
                                    </div>
                                ) : (
                                    filteredProposals.map((proposal) => (
                                        <Card key={proposal.id} className="border-l-4 border-l-primary">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                                                        <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${proposal.status === "InProgress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : proposal.status === "Ended"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                            }`}>
                                                            {proposal.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-4">
                                                        <div className="text-sm">
                                                            <span className="text-green-600 font-medium">For: {proposal.forVotes}</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-red-600 font-medium">Against: {proposal.againstVotes}</span>
                                                        </div>
                                                    </div>
                                                    {currentAccount && proposal.status === "InProgress" && userTokenBalance > 0 && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-green-500 text-green-600 hover:bg-green-50"
                                                                onClick={() => handleVote(proposal.id, "for", Math.min(100, userTokenBalance))}
                                                                disabled={isLoading}
                                                            >
                                                                Vote For
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-500 text-red-600 hover:bg-red-50"
                                                                onClick={() => handleVote(proposal.id, "against", Math.min(100, userTokenBalance))}
                                                                disabled={isLoading}
                                                            >
                                                                Vote Against
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Mint Tokens Dialog */}
                <Dialog open={isMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mint DAO Tokens</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="mintAmount">Amount to mint</Label>
                                <Input
                                    id="mintAmount"
                                    type="number"
                                    placeholder="1000"
                                    value={mintAmount}
                                    onChange={(e) => setMintAmount(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    This will mint {mintAmount} ZL tokens to your wallet
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsMintDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleMintTokens} disabled={isLoading || !mintAmount}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Minting...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="w-4 h-4 mr-2" />
                                            Mint Tokens
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Create Proposal Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Create New Proposal</DialogTitle>
                            <p className="text-muted-foreground">
                                Choose the type of proposal and fill in the required details
                            </p>
                        </DialogHeader>
                        <div className="space-y-6">
                            {/* Proposal Type Selection */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg font-medium">Proposal Type *</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Select the type of action you want to propose
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${newProposal.type === "AddAddressToAllowlist"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => setNewProposal({ ...newProposal, type: "AddAddressToAllowlist" })}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${newProposal.type === "AddAddressToAllowlist"
                                                    ? "border-primary bg-primary"
                                                    : "border-border"
                                                    }`} />
                                                <div className="flex-1">
                                                    <h4 className="font-medium">Add to Allowlist</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Propose adding an address to a leak document allowlist
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${newProposal.type === "StartBountyTally"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => setNewProposal({ ...newProposal, type: "StartBountyTally" })}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full border-2 ${newProposal.type === "StartBountyTally"
                                                    ? "border-primary bg-primary"
                                                    : "border-border"
                                                    }`} />
                                                <div className="flex-1">
                                                    <h4 className="font-medium">Start Bounty Tally</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Propose starting the voting phase for a bounty
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Proposal Info */}
                                {newProposal.type && (
                                    <div className="space-y-4 border-t pt-6">
                                        <div>
                                            <Label htmlFor="proposalTitle">Proposal Title *</Label>
                                            <Input
                                                id="proposalTitle"
                                                placeholder={
                                                    newProposal.type === "AddAddressToAllowlist"
                                                        ? "e.g., Grant access to government official"
                                                        : "e.g., Start voting for bug bounty submissions"
                                                }
                                                value={newProposal.title}
                                                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="proposalDescription">Description *</Label>
                                            <Textarea
                                                id="proposalDescription"
                                                placeholder="Provide detailed reasoning for this proposal..."
                                                rows={4}
                                                value={newProposal.description}
                                                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Allowlist Proposal Specific Fields */}
                                {newProposal.type === "AddAddressToAllowlist" && (
                                    <div className="space-y-6 border-t pt-6">
                                        <div>
                                            <Label className="text-lg font-medium">Allowlist Selection</Label>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Choose which leak document allowlist to add the address to
                                            </p>

                                            {/* Display available leaks/allowlists from store */}
                                            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                                {leaks.filter((leak) => leak.allowlistIdx !== undefined).map((leak, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${newProposal.allowlistIdx === index.toString()
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                            }`}
                                                        onClick={() => setNewProposal({ ...newProposal, allowlistIdx: leak.allowlistIdx!.toString() })}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 mt-1 ${newProposal.allowlistIdx === index.toString()
                                                                ? "border-primary bg-primary"
                                                                : "border-border"
                                                                }`} />
                                                            <div className="flex-1">
                                                                <h4 className="font-medium">{leak.title}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {leak.summary}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs bg-muted px-2 py-1 rounded">Index: {index}</span>
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                        {leak.category}
                                                                    </span>
                                                                    {leak.allowlistIdx !== undefined && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Allowlist #{leak.allowlistIdx}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        <div className="border-t pt-4">
                                            <Label className="text-lg font-medium">Applicant Information</Label>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Details about the person requesting access
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="proposalName">Full Name *</Label>
                                                    <Input
                                                        id="proposalName"
                                                        placeholder="e.g., John Doe"
                                                        value={newProposal.proposalInfo.name}
                                                        onChange={(e) => setNewProposal({
                                                            ...newProposal,
                                                            proposalInfo: { ...newProposal.proposalInfo, name: e.target.value }
                                                        })}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="proposalPosition">Position/Title *</Label>
                                                    <Input
                                                        id="proposalPosition"
                                                        placeholder="e.g., Senior Investigator"
                                                        value={newProposal.proposalInfo.position}
                                                        onChange={(e) => setNewProposal({
                                                            ...newProposal,
                                                            proposalInfo: { ...newProposal.proposalInfo, position: e.target.value }
                                                        })}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <Label htmlFor="proposalAgency">Organization/Agency *</Label>
                                                    <Input
                                                        id="proposalAgency"
                                                        placeholder="e.g., Federal Bureau of Investigation"
                                                        value={newProposal.proposalInfo.agency}
                                                        onChange={(e) => setNewProposal({
                                                            ...newProposal,
                                                            proposalInfo: { ...newProposal.proposalInfo, agency: e.target.value }
                                                        })}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bounty Tally Proposal Specific Fields */}
                                {newProposal.type === "StartBountyTally" && (
                                    <div className="space-y-6 border-t pt-6">
                                        <div>
                                            <Label className="text-lg font-medium">Bounty Selection</Label>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Choose which bounty to start the voting phase for (only bounties you created)
                                            </p>

                                            {/* Display user's bounties from store */}
                                            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                                {bounties
                                                    .filter(bounty => bounty.creator === currentAccount?.address &&
                                                        (bounty.status === "Claimed" || bounty.status === "Open"))
                                                    .map((bounty) => (
                                                        <div
                                                            key={bounty.id}
                                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${newProposal.bountyIdx === bounty.id
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                                }`}
                                                            onClick={() => setNewProposal({ ...newProposal, bountyIdx: bounty.id })}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`w-4 h-4 rounded-full border-2 mt-1 ${newProposal.bountyIdx === bounty.id
                                                                    ? "border-primary bg-primary"
                                                                    : "border-border"
                                                                    }`} />
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium">
                                                                        {bounty.title}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {bounty.description}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="text-xs bg-muted px-2 py-1 rounded">
                                                                            {bounty.reward} SUI
                                                                        </span>
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                            {bounty.submissions.length} submissions
                                                                        </span>
                                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                            {bounty.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateProposal}
                                    disabled={
                                        isLoading ||
                                        !newProposal.type ||
                                        !newProposal.title ||
                                        !newProposal.description ||
                                        (newProposal.type === "AddAddressToAllowlist" &&
                                            (!newProposal.proposalInfo.name ||
                                                !newProposal.proposalInfo.agency || !newProposal.proposalInfo.position))
                                    }
                                    className="min-w-32"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Proposal
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
