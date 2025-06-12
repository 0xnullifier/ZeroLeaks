import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { Link } from "react-router";
import { useBountyStore } from "@/lib/bounty-store";
import type { BountySubmission } from "@/lib/types";
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
    TrendingUp,
    Target,
    Award
} from "lucide-react";
import type { UIProposal } from "@/lib/proposal-store";
import { COIN_DECIMAL } from "@/lib/constant";

interface ProposalCardProps {
    proposal: UIProposal;
    onVote: (proposalId: string, vote: "for" | "against", tokenAmount: number) => Promise<void>;
    userTokenBalance: number;
}

export function ProposalCard({ proposal, onVote, userTokenBalance }: ProposalCardProps) {
    const [voteAmount, setVoteAmount] = useState("100");
    const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
    const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null);
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<BountySubmission | null>(null);

    // Get bounty store to fetch submissions
    const getBountyById = useBountyStore((state) => state.getBountyById);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "InProgress":
            case "active":
                return <Clock className="h-4 w-4" />;
            case "Ended":
            case "passed":
                return <CheckCircle className="h-4 w-4" />;
            case "Tally":
            case "rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "InProgress":
            case "active":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300";
            case "Ended":
            case "passed":
                return "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300";
            case "Tally":
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
            case "claim_bounty":
                return "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-300";
            case "bounty_action":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300";
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
            case "claim_bounty":
                return "Claim Bounty";
            case "bounty_action":
                return "Bounty Submission";
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


    const handleVoteClick = (vote: "for" | "against") => {
        setSelectedVote(vote);
        setIsVoteDialogOpen(true);
    };

    const handleBountyVoting = () => {
        // For BountyAction proposals, show submission selection dialog
        if (proposal.action === "BountyAction" && proposal.bountyInfo) {
            setIsSubmissionDialogOpen(true);
        }
    };

    const handleSubmissionSelect = (submission: BountySubmission) => {
        setSelectedSubmission(submission);
        setIsSubmissionDialogOpen(false);
        setSelectedVote("for"); // Set to "for" since we're voting for a specific submission
        setIsVoteDialogOpen(true);
    };

    const handleSubmitVote = async () => {
        if (selectedVote && voteAmount && parseInt(voteAmount) > 0) {
            await onVote(proposal.id, selectedVote, parseInt(voteAmount));
            setIsVoteDialogOpen(false);
            setSelectedVote(null);
            setSelectedSubmission(null);
            setVoteAmount("100");
        }
    };

    const handleVoteDialogClose = (open: boolean) => {
        setIsVoteDialogOpen(open);
        if (!open) {
            setSelectedVote(null);
            setSelectedSubmission(null);
        }
    };

    const isVotingActive = proposal.status === "InProgress" && proposal.endTime > Date.now();
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
                            {formatProposer(proposal.targetAddress!)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {formatDateTime(proposal.createdAt || Date.now(), { showTime: false })}
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

                {/* Bounty Information for BountyAction Proposals */}
                {proposal.bountyInfo && proposal.action === "BountyAction" && (
                    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                Bounty Submission Voting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <span className="font-medium">Bounty: </span>
                                        <Link
                                            to={`/bounties/${proposal.bountyInfo.bountyId}`}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {proposal.bountyInfo.bountyTitle}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        <span className="font-medium">{proposal.bountyInfo.submissionCount}</span> submission{proposal.bountyInfo.submissionCount !== 1 ? 's' : ''} received
                                    </span>
                                </div>
                            </div>

                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                    <Vote className="h-4 w-4" />
                                    <span className="font-medium">
                                        Community is voting to select the winning submission for this bounty
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Voting Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">
                            {proposal.action === "BountyAction" ? "Submission Votes" : "Voting Progress"}
                        </span>
                        <span className="text-muted-foreground">
                            {proposal.totalVotes.toLocaleString()} votes
                        </span>
                    </div>

                    {proposal.action === "BountyAction" && proposal.bountyInfo ? (
                        // Show submission voting progress for bounty actions
                        <div className="space-y-3">
                            {(() => {
                                const bounty = getBountyById(proposal.bountyInfo.bountyId);
                                const submissions = bounty?.submissions || [];

                                if (submissions.length === 0) {
                                    return (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No submissions yet</p>
                                        </div>
                                    );
                                }

                                const totalVotes = (submissions.reduce((sum, s) => sum + s.votes, 0))

                                return submissions.map((submission, index) => (
                                    <div key={submission.id || index} className="bg-muted/30 rounded-lg p-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        Submission #{index + 1}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {submission.by.slice(0, 6)}...{submission.by.slice(-4)}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 overflow-hidden" style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {submission.content.length > 100
                                                        ? `${submission.content.substring(0, 100)}...`
                                                        : submission.content
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-bold text-primary">
                                                    {(submission.votes / COIN_DECIMAL).toLocaleString()} ZL
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {totalVotes > 0 ? ((submission.votes / totalVotes) * 100).toFixed(1) : 0}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: totalVotes > 0 ? `${(submission.votes / totalVotes) * 100}%` : '0%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        // Show traditional for/against progress for other proposals
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                            For
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                        {((proposal.votesFor / Math.max(proposal.totalVotes, 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                                    {proposal.votesFor.toLocaleString()} ZL
                                </p>
                            </div>

                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ThumbsDown className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Against
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                                        {((proposal.votesAgainst / Math.max(proposal.totalVotes, 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-1">
                                    {proposal.votesAgainst.toLocaleString()} ZL
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Voting Buttons */}
                {isVotingActive && (
                    <div className="flex gap-3 pt-2">
                        {proposal.action === "BountyAction" ? (
                            // Single button for bounty voting
                            <Button
                                onClick={handleBountyVoting}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white relative overflow-hidden shadow-lg"
                                disabled={userTokenBalance === 0}
                            >
                                <span
                                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60"
                                    style={{
                                        animation: "shine-linear 1.5s linear infinite"
                                    }}
                                />
                                <Award className="h-4 w-4 mr-2" />
                                Vote on Submissions
                            </Button>
                        ) : (
                            // Traditional for/against buttons for other proposals
                            <>
                                <Button
                                    onClick={() => handleVoteClick("for")}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white relative overflow-hidden shadow-lg"
                                    disabled={userTokenBalance === 0}
                                >
                                    <span
                                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60"
                                        style={{
                                            animation: "shine-linear 1.5s linear infinite"
                                        }}
                                    />
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Vote For
                                </Button>
                                <Button
                                    onClick={() => handleVoteClick("against")}
                                    variant="destructive"
                                    className="flex-1 relative overflow-hidden shadow-lg"
                                    disabled={userTokenBalance === 0}
                                >
                                    <span
                                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60"
                                        style={{
                                            animation: "shine-linear 1.5s linear infinite"
                                        }}
                                    />
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    Vote Against
                                </Button>
                            </>
                        )}
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

            {/* Submission Selection Dialog for BountyAction proposals */}
            <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Vote on Bounty Submissions
                        </DialogTitle>
                        <DialogDescription>
                            Select the submission you want to vote for. Your vote will help determine the winning submission for this bounty.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {proposal.bountyInfo && (() => {
                            const bounty = getBountyById(proposal.bountyInfo.bountyId);
                            const submissions = bounty?.submissions || [];

                            if (submissions.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <div className="text-lg font-medium text-muted-foreground mb-2">
                                            No submissions yet
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            This bounty hasn't received any submissions yet.
                                        </div>
                                    </div>
                                );
                            }

                            const totalVotes = submissions.reduce((sum, s) => sum + s.votes, 0);

                            return (
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                                        <span>{submissions.length} submission{submissions.length !== 1 ? 's' : ''} received</span>
                                        <span>{totalVotes.toLocaleString()} total votes</span>
                                    </div>

                                    {submissions.map((submission, index) => (
                                        <Card
                                            key={submission.id || index}
                                            className="border-2 cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200 group"
                                            onClick={() => handleSubmissionSelect(submission)}
                                        >
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                                                    Submission #{index + 1}
                                                                </Badge>
                                                                <div className="text-sm text-muted-foreground">
                                                                    by <span className="font-medium">{submission.by}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-primary">
                                                                {submission.votes.toLocaleString()} ZL
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {totalVotes > 0 ? ((submission.votes / totalVotes) * 100).toFixed(1) : 0}% of votes
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="bg-muted/30 rounded-lg p-4">
                                                        <div className="text-sm leading-relaxed">
                                                            {submission.content.length > 300 ? (
                                                                <>
                                                                    {submission.content.substring(0, 300)}
                                                                    <span className="text-muted-foreground">... </span>
                                                                    <button className="text-primary hover:underline text-xs font-medium">
                                                                        Read more
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                submission.content
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Attachments */}
                                                    {submission.article && (
                                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                                                            <FileText className="h-4 w-4" />
                                                            <span>Article attachment included</span>
                                                        </div>
                                                    )}

                                                    {/* Vote Progress Bar */}
                                                    {totalVotes > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="w-full bg-muted rounded-full h-2">
                                                                <div
                                                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${(submission.votes / totalVotes) * 100}%`
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            size="sm"
                                                            className="group-hover:bg-primary group-hover:text-white transition-colors"
                                                            variant="outline"
                                                        >
                                                            <Vote className="h-4 w-4 mr-2" />
                                                            Vote for this submission
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            );
                        })()}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setIsSubmissionDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Vote Dialog */}
            <Dialog open={isVoteDialogOpen} onOpenChange={handleVoteDialogClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Vote className="h-5 w-5 text-primary" />
                            Confirm Your Vote
                        </DialogTitle>
                        <DialogDescription>
                            {proposal.action === "BountyAction" && selectedSubmission ? (
                                <div className="space-y-3">
                                    <div>
                                        You are voting <strong className="text-primary">FOR</strong> this bounty submission.
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                                            <Award className="h-4 w-4" />
                                            Selected Submission
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                Submission #{(() => {
                                                    if (proposal.bountyInfo) {
                                                        const bounty = getBountyById(proposal.bountyInfo.bountyId);
                                                        const index = bounty?.submissions.findIndex(s => s.id === selectedSubmission.id);
                                                        return index !== undefined && index >= 0 ? index + 1 : "Unknown";
                                                    }
                                                    return "Unknown";
                                                })()} by {selectedSubmission.by}
                                            </div>
                                            <div className="text-muted-foreground mt-1 overflow-hidden" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {selectedSubmission.content.length > 100
                                                    ? `${selectedSubmission.content.substring(0, 100)}...`
                                                    : selectedSubmission.content
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    You are voting <strong className={selectedVote === "for" ? "text-green-600" : "text-red-600"}>
                                        {selectedVote === "for" ? "FOR" : "AGAINST"}
                                    </strong> this proposal.
                                </div>
                            )}
                            <div className="mt-3 text-sm">
                                Choose how many DAO tokens to commit to your vote.
                            </div>
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
                                className="mt-1"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>Min: 1 ZL</span>
                                <span>Available: {userTokenBalance.toLocaleString()} ZL</span>
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

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => handleVoteDialogClose(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitVote}
                                disabled={!hasEnoughTokens || !voteAmount || parseInt(voteAmount) <= 0}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Vote className="h-4 w-4 mr-2" />
                                Cast Vote ({parseInt(voteAmount || "0").toLocaleString()} ZL)
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
