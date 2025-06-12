import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote, Users, DollarSign, AlertCircle, Coins, Loader2, Shield, ReceiptIcon } from "lucide-react";
import { CreateProposalSheet, ProposalCard, VotingStats, TokenBalance } from "@/components/dao";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { BOUNTIES_OBJECT_ID, COIN_OBJECT_ID, DAO_OBJECT_ID, LEAKS_OBJECT_ID, PACKAGE_ID } from "@/lib/constant";
import { useLeaksStore } from "@/lib/leaks-store";
import { useProposalStore } from "@/lib/proposal-store";
import { toast } from "sonner";
import { Transaction } from "@mysten/sui/transactions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { useBountyStore } from "@/lib/bounty-store";

export function DAOPage() {
    const currentAccount = useCurrentAccount();
    const [activeTab, setActiveTab] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [IsMintDialogOpen, setIsMintDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mintAmount, setMintAmount] = useState("1000");
    const [isAdmin, setIsAdmin] = useState(false);

    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()

    const { leaks, fetchLeaks } = useLeaksStore();
    const {
        proposals,
        fetchProposals,
        getFilteredProposals,
        voteOnProposal,
        getActiveProposals,
        getTotalVotesCast
    } = useProposalStore();

    const { bounties, fetchBounties } = useBountyStore()

    const filteredProposals = getFilteredProposals().filter(proposal => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return proposal.status === "InProgress";
        if (activeTab === "access") return proposal.category === "access_grant";
        if (activeTab === "governance") return proposal.category === "governance";
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
    console.log("DAO Data:", daoData);

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

    const { data: bountiesData } = useSuiClientQuery(
        "getObject",
        {
            id: BOUNTIES_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        }
    );
    console.log("Bounties Data:", bountiesData);

    useEffect(() => {
        if (leaks.length === 0 && leaksData) {
            console.log(leaksData)
            fetchLeaks(leaksData);
        }
    }, [leaksData, leaks.length, fetchLeaks]);

    useEffect(() => {
        const fn = async () => {
            if (daoData && proposals.length === 0 && bountiesData) {
                await fetchBounties(bountiesData);
                await fetchProposals(daoData);
            }
        }
        fn();
    }, [daoData, bountiesData, proposals.length, fetchProposals]);

    // Check if current user is admin
    useEffect(() => {
        if (daoData?.data?.content && currentAccount?.address) {
            const content = daoData.data.content as any;
            if (content.dataType === "moveObject" && content.fields) {
                const admins = content.fields.admins || [];
                setIsAdmin(admins.includes(currentAccount.address));
            }
        }
    }, [daoData, currentAccount]);

    const userTokenBalance = zlTokenBalance ? parseInt(zlTokenBalance.totalBalance) / 1000000000 : 0;
    const suiClient = useSuiClient()
    const handleVote = async (proposalId: string, vote: "for" | "against", tokenAmount: number) => {
        console.log("Casting vote:", proposalId, vote, tokenAmount);
        const tx = new Transaction();
        const coin = await suiClient.getCoins({
            owner: currentAccount?.address!,
            coinType: `${PACKAGE_ID}::zl_dao::ZL_DAO`,
        })
        const coinArg = tx.splitCoins(coin.data[0].coinObjectId, [tx.pure.u64(tokenAmount * 1e9)])
        console.log("Coin argument:", coinArg);

        tx.moveCall({
            target: `${PACKAGE_ID}::zl_dao::vote`,
            arguments: [
                tx.pure.u64(proposalId),
                coinArg,
                tx.pure.bool(vote === "for"),
                tx.pure.u64(0), // submission index is not needed
                tx.object(BOUNTIES_OBJECT_ID),
                tx.object('0x6'), // clock
                tx.object(DAO_OBJECT_ID),
            ],
        });
        tx.setGasBudget(100000000);
        const { digest } = await signAndExecuteTransaction({
            transaction: tx,
        });
        toast.success("Vote cast successfully!", {
            action: {
                label: "View Transaction",
                onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
            },
        });

    };

    const activeProposals = getActiveProposals().length;
    const totalProposals = proposals.length;
    const totalVotes = getTotalVotesCast();

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
                                className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-end"
                            >
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
                                    className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                                    style={{ boxShadow: "0 0 16px 4px #60a5fa, 0 0 32px 8px #3b82f6" }}
                                >
                                    {/* Shining effect */}
                                    <span className="absolute inset-0 pointer-events-none">
                                        <span className="absolute left-[-75%] top-0 h-full w-1/3 bg-white opacity-30 animate-shine" />
                                    </span>
                                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                                    <span className="relative z-10">Create New Proposal</span>
                                </Button>

                                {/* Admin Panel Button - only show to admins */}
                                {isAdmin && (
                                    <Link to="/dao/admin">
                                        <Button
                                            variant="outline"
                                            className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/20"
                                        >
                                            <Shield className="h-4 w-4 mr-2" />
                                            Admin Panel
                                        </Button>
                                    </Link>
                                )}

                                <style>{`
                                @keyframes shine {
                                  0% { left: -75%; }
                                  100% { left: 120%; }
                                }
                                .animate-shine {
                                  animation: shine 1.5s linear infinite;
                                }
                                `}</style>
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
                                    <>
                                        <Button
                                            onClick={() => setIsCreateDialogOpen(true)}
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Proposal
                                        </Button>
                                    </>
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

                {/* Create Proposal Sheet */}
                <CreateProposalSheet
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    refetchDao={refetchDao}
                />
            </main>
            <Dialog open={IsMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
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

        </div>
    );
}