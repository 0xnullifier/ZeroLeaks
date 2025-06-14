import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils";
import {
    Shield,
    CheckCircle,
    Clock,
    AlertTriangle,
    Play,
    Loader2,
    Users,
    Vote
} from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { motion } from "framer-motion";
import { DAO_OBJECT_ID, BOUNTIES_OBJECT_ID, PACKAGE_ID } from "@/lib/constant";
import { useProposalStore, type UIProposal } from "@/lib/proposal-store";
import { toast } from "sonner";
import { useRefetchAll } from "@/hooks/useRefetchAll";

export function DAOAdminPage() {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [isExecuting, setIsExecuting] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState("ready");

    const { proposals, fetchProposals } = useProposalStore();
    console.log("Proposals:", proposals);

    // Use centralized refetch hook
    const { refetchAll, daoData } = useRefetchAll();
    console.log(daoData)
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

    // Fetch proposals on component mount
    useEffect(() => {
        if (daoData?.data?.content) {
            fetchProposals(daoData);
        }
    }, [daoData, fetchProposals]);

    const executeProposal = async (proposal: UIProposal) => {
        if (!currentAccount) {
            toast.error("Please connect your wallet");
            return;
        }

        setIsExecuting(proposal.id);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::zl_dao::execute_proposal`,
                arguments: [
                    tx.pure.u64(parseInt(proposal.id)),
                    tx.object("0x6"), // Clock object
                    tx.object(DAO_OBJECT_ID),
                    tx.object(BOUNTIES_OBJECT_ID),
                ],
            });

            tx.setGasBudget(10000000);
            const { digest } = await signAndExecuteTransaction({ transaction: tx });

            toast.success("Proposal executed successfully!", {
                action: {
                    label: "View Transaction",
                    onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
                },
            });

            // Refresh all data after executing proposal
            await refetchAll();
            if (daoData?.data?.content) {
                await fetchProposals(daoData.data.content);
            }

        } catch (error: any) {
            console.error("Error executing proposal:", error);
            toast.error(error?.message || "Failed to execute proposal");
        } finally {
            setIsExecuting(null);
        }
    };

    const getProposalsByStatus = () => {
        const now = Date.now();

        const readyToExecute = proposals.filter(proposal =>
            proposal.status === "InProgress" &&
            proposal.endTime <= now
        );

        const inProgress = proposals.filter(proposal =>
            proposal.status === "InProgress" &&
            proposal.endTime > now
        );

        const executed = proposals.filter(proposal =>
            proposal.status === "Passed"
        );

        return { readyToExecute, inProgress, executed };
    };

    const { readyToExecute, inProgress, executed } = getProposalsByStatus();

    // If not admin, show access denied
    if (!isAdmin && currentAccount) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <Shield className="h-24 w-24 text-red-500 mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Access Denied
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            You need to be a DAO admin to access this page. Only authorized administrators can execute proposals.
                        </p>
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // If no wallet connected
    if (!currentAccount) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <Users className="h-24 w-24 text-blue-500 mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Connect Your Wallet
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            Please connect your wallet to access the DAO admin panel.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const ProposalCard = ({ proposal }: { proposal: UIProposal }) => {
        const isExpired = proposal.endTime <= Date.now();
        const canExecute = proposal.status === "InProgress" && isExpired;
        const isBeingExecuted = isExecuting === proposal.id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
            >
                <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg mb-2 group-hover:text-blue-600">
                                    {proposal.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={
                                        proposal.status === "Passed" || proposal.status === "Rejected" ? "default" :
                                            canExecute ? "destructive" : "secondary"
                                    }>
                                        {proposal.status === "Passed" || proposal.status === "Rejected" ? "Executed" :
                                            canExecute ? "Ready to Execute" : "In Progress"}
                                    </Badge>
                                    <Badge variant="outline">
                                        {proposal.category}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                    Proposal #{proposal.id}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                            {proposal.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <div className="text-sm font-medium text-green-600">Votes For</div>
                                <div className="text-xl font-bold">{proposal.votesFor.toLocaleString()} ZL</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-red-600">Votes Against</div>
                                <div className="text-xl font-bold">{proposal.votesAgainst.toLocaleString()} ZL</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {isExpired ? "Voting ended" : `Ends ${formatDateTime(proposal.endTime)}`}
                            </div>

                            {canExecute && (
                                <Button
                                    onClick={() => executeProposal(proposal)}
                                    disabled={isBeingExecuted}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isBeingExecuted ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Execute
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            DAO Admin Panel
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Execute proposals and manage DAO operations
                    </p>
                </motion.div>

                {/* Admin Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                >
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            You are authenticated as a DAO administrator. You can execute proposals that have finished voting.
                        </AlertDescription>
                    </Alert>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ready to Execute</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{readyToExecute.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Vote className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Executed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{executed.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Proposals Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ready" className="relative">
                            Ready to Execute
                            {readyToExecute.length > 0 && (
                                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                                    {readyToExecute.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="progress">In Progress</TabsTrigger>
                        <TabsTrigger value="executed">Executed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ready" className="space-y-4">
                        {readyToExecute.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                                    <p className="text-muted-foreground text-center">
                                        No proposals are ready for execution at the moment.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            readyToExecute.map((proposal) => (
                                <ProposalCard key={proposal.id} proposal={proposal} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                        {inProgress.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Clock className="h-12 w-12 text-blue-500 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No active proposals</h3>
                                    <p className="text-muted-foreground text-center">
                                        There are no proposals currently in voting phase.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            inProgress.map((proposal) => (
                                <ProposalCard key={proposal.id} proposal={proposal} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="executed" className="space-y-4">
                        {executed.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No executed proposals</h3>
                                    <p className="text-muted-foreground text-center">
                                        No proposals have been executed yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            executed.map((proposal) => (
                                <ProposalCard key={proposal.id} proposal={proposal} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
