import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    User,
    Building,
    Shield,
    FileText,
    Vote,
    Calendar,
    TrendingUp
} from "lucide-react";
import type { Proposal } from "@/pages/dao";

interface ProposalCardProps {
    proposal: Proposal;
    onVote: (proposalId: string, vote: "for" | "against", tokenAmount: number) => void;
    userTokenBalance: number;
}

export function ProposalCard({ proposal, onVote, userTokenBalance }: ProposalCardProps) {
    const [voteAmount, setVoteAmount] = useState("100");
    const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
    const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Clock className="h-4 w-4" />;
            case "passed":
                return <CheckCircle className="h-4 w-4" />;
            case "rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300";
            case "passed":
                return "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300";
            case "rejected":
                return "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-300";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "access_grant":
                return "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300";
            case "governance":
                return "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-300";
            case "treasury":
                return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300";
            case "protocol":
                return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-300";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-300";
        }
    };

    const formatCategory = (category: string) => {
        switch (category) {
            case "access_grant":
                return "Access Grant";
            case "governance":
                return "Governance";
            case "treasury":
                return "Treasury";
            case "protocol":
                return "Protocol";
            default:
                return category;
        }
    };

    const formatTimeRemaining = (endTime: number) => {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) return "Voting ended";

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''} remaining`;
        } else {
            return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
        }
    };

    const formatProposer = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const votePercentage = proposal.totalVotes > 0
        ? (proposal.votesFor / proposal.totalVotes) * 100
        : 0;

    const progressPercentage = proposal.requiredVotes > 0
        ? Math.min((proposal.totalVotes / proposal.requiredVotes) * 100, 100)
        : 0;

    const handleVoteClick = (vote: "for" | "against") => {
        setSelectedVote(vote);
        setIsVoteDialogOpen(true);
    };

    const handleSubmitVote = () => {
        if (selectedVote && voteAmount && parseInt(voteAmount) > 0) {
            onVote(proposal.id, selectedVote, parseInt(voteAmount));
            setIsVoteDialogOpen(false);
            setSelectedVote(null);
            setVoteAmount("100");
        }
    };

    const isVotingActive = proposal.status === "active" && proposal.endTime > Date.now();
    const hasEnoughTokens = parseInt(voteAmount) <= userTokenBalance;

    return (
        <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
            <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
                            {proposal.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                                {getStatusIcon(proposal.status)}
                                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className={getCategoryColor(proposal.category)}>
                                {formatCategory(proposal.category)}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {formatProposer(proposal.proposer)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {formatDate(proposal.createdAt)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {formatTimeRemaining(proposal.endTime)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {proposal.totalVotes.toLocaleString()} votes
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                    {proposal.description}
                </p>

                {/* Official Information for Access Grant Proposals */}
                {proposal.officialInfo && (
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Official Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{proposal.officialInfo.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>{proposal.officialInfo.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {proposal.officialInfo.position}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <Badge variant="secondary" className="text-xs">
                                        {proposal.officialInfo.clearanceLevel}
                                    </Badge>
                                </div>
                            </div>

                            {proposal.officialInfo.requestedDocuments.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Requested Documents:</span>
                                    </div>
                                    <div className="space-y-1">
                                        {proposal.officialInfo.requestedDocuments.map((doc, index) => (
                                            <div key={index} className="text-sm text-muted-foreground bg-background/50 rounded px-2 py-1">
                                                • {doc}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Voting Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Voting Progress</span>
                        <span className="text-muted-foreground">
                            {proposal.totalVotes.toLocaleString()} / {proposal.requiredVotes.toLocaleString()} votes required
                        </span>
                    </div>

                    <Progress value={progressPercentage} className="h-2" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">For</span>
                                </div>
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                    {((proposal.votesFor / Math.max(proposal.totalVotes, 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                                {proposal.votesFor.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Against</span>
                                </div>
                                <span className="text-sm font-bold text-red-700 dark:text-red-300">
                                    {((proposal.votesAgainst / Math.max(proposal.totalVotes, 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                                {proposal.votesAgainst.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Voting Buttons */}
                {isVotingActive && (
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => handleVoteClick("for")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            disabled={userTokenBalance === 0}
                        >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Vote For
                        </Button>
                        <Button
                            onClick={() => handleVoteClick("against")}
                            variant="destructive"
                            className="flex-1"
                            disabled={userTokenBalance === 0}
                        >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Vote Against
                        </Button>
                    </div>
                )}

                {userTokenBalance === 0 && isVotingActive && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4" />
                            You need DAO tokens to participate in voting.
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Vote Dialog */}
            <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Vote className="h-5 w-5" />
                            Cast Your Vote
                        </DialogTitle>
                        <DialogDescription>
                            You are voting <strong className={selectedVote === "for" ? "text-green-600" : "text-red-600"}>
                                {selectedVote === "for" ? "FOR" : "AGAINST"}
                            </strong> this proposal.
                            Choose how many DAO tokens to commit to your vote.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="voteAmount">Token Amount</Label>
                            <Input
                                id="voteAmount"
                                type="number"
                                placeholder="100"
                                value={voteAmount}
                                onChange={(e) => setVoteAmount(e.target.value)}
                                min="1"
                                max={userTokenBalance}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Min: 1 token</span>
                                <span>Available: {userTokenBalance.toLocaleString()} tokens</span>
                            </div>
                        </div>

                        {!hasEnoughTokens && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                                    <AlertCircle className="h-4 w-4" />
                                    Insufficient token balance
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsVoteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitVote}
                                disabled={!hasEnoughTokens || !voteAmount || parseInt(voteAmount) <= 0}
                                className={selectedVote === "for" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                Confirm Vote
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
