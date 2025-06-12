import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatDeadlineWithTimeLeft } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar,
    Coins,
    Clock,
    User,
    Shield,
    Trophy,
    Users,
    AlertTriangle,
    Send,
    ChevronDown,
    Eye,
    EyeOff
} from "lucide-react";
import { useBountyStore } from "@/lib/bounty-store";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, BOUNTIES_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner";

export function BountyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { getBountyById, fetchBounties } = useBountyStore();

    const [bounty, setBounty] = useState(() => getBountyById(id || ""));
    const [expandedArticles, setExpandedArticles] = useState<{ [key: number]: boolean }>({});
    const [collapsedSubmissions, setCollapsedSubmissions] = useState<{ [key: number]: boolean }>({});
    const [showAllSubmissions, setShowAllSubmissions] = useState(false);
    console.log(bounty?.submissions)

    // Fetch ZL_DAO token balance for voting
    const { data: tokenBalance } = useSuiClientQuery(
        'getBalance',
        {
            owner: currentAccount?.address || "",
            coinType: `${PACKAGE_ID}::zl_dao::ZL_DAO`,
        },
        {
            enabled: !!currentAccount?.address,
        }
    );


    // Fetch bounties data from blockchain
    const { data: bountiesData } = useSuiClientQuery(
        'getObject',
        {
            id: BOUNTIES_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        },
        {
            enabled: !!BOUNTIES_OBJECT_ID,
        }
    );


    useEffect(() => {
        if (bountiesData) {
            // Use the store's fetchBounties method to handle data parsing
            fetchBounties(bountiesData);
        }
    }, [bountiesData, fetchBounties]);

    useEffect(() => {
        if (!bounty) {
            const foundBounty = getBountyById(id || "");
            setBounty(foundBounty);
        }
    }, [id, getBountyById, bounty]);

    if (!bounty) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Bounty not found</h1>
                    <p className="text-muted-foreground mb-6">
                        The bounty you're looking for doesn't exist or has been removed.
                    </p>
                    <Button asChild>
                        <Link to="/bounties">Back to Bounties</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isCreator = currentAccount?.address === bounty.creator;
    const canSubmit = currentAccount && !isCreator && bounty.status === "Open";
    const canVote = currentAccount && !isCreator && bounty.status === "Tally";
    const userTokenBalance = tokenBalance ? parseInt(tokenBalance.totalBalance) / 1_000_000_000 : 0;

    const handleSubmitProof = () => {
        if (!currentAccount) {
            toast.error("Please connect your wallet to submit a proof");
            return;
        }

        // Navigate to submission page
        navigate(`/bounties/${bounty.id}/submit`);
    };



    const getStatusColor = (status: string) => {
        switch (status) {
            case "Open": return "bg-green-500";
            case "Claimed": return "bg-blue-500";
            case "Tally": return "bg-yellow-500";
            case "Closed": return "bg-gray-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "Open": return "Open";
            case "Claimed": return "Claimed";
            case "Tally": return "In Tally";
            case "Closed": return "Closed";
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link to="/bounties">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Bounties
                            </Link>
                        </Button>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-primary">
                                        {bounty.category[0] || "General"}
                                    </Badge>
                                    {bounty.category.length > 1 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{bounty.category.length - 1} more
                                        </Badge>
                                    )}
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(bounty.status)}`}></div>
                                    <span className="text-sm text-muted-foreground">
                                        {getStatusText(bounty.status)}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                    {bounty.title}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {bounty.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-muted-foreground">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Reward Display */}
                            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                                <CardContent className="pt-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Coins className="h-6 w-6 text-amber-600" />
                                        <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                            {bounty.reward} SUI
                                        </span>
                                    </div>
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        Reward Amount
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {bounty.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Required Information */}
                            {bounty.requiredInfo && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            Required Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {bounty.requiredInfo}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Verification Criteria */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        Verification Criteria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {bounty.verificationCriteria || "Submissions must include valid zero-knowledge proofs that will be verified using the configured verification key."}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(bounty.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Deadline</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(bounty.deadline)}
                                            </p>
                                            {bounty.status === "Open" && (
                                                <p className="text-xs text-amber-600">
                                                    {formatDeadlineWithTimeLeft(bounty.deadline, bounty.status).timeLeft}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Creator */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-purple-600" />
                                        Creator
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={`https://suiscan.xyz/testnet/account/${bounty.creator}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-mono text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors underline decoration-dotted hover:decoration-solid"
                                    >
                                        {bounty.creator.slice(0, 6)}...{bounty.creator.slice(-6)}
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submissions - Full Width */}
                    <div className="space-y-6 mt-10">
                        {/* Header */}
                        <div className="bg-background border p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                        <Users className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Submissions</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {bounty.submissions.length} response{bounty.submissions.length !== 1 ? 's' : ''} received
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {bounty.submissions.length > 0 && (
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">{bounty.submissions.length} Verified</div>
                                        </div>
                                    )}
                                    {bounty.submissions.length > 3 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                                            className="flex items-center gap-2"
                                        >
                                            {showAllSubmissions ? (
                                                <>
                                                    <EyeOff className="h-4 w-4" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4" />
                                                    Show All ({bounty.submissions.length})
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {bounty.submissions.length === 0 ? (
                            <div className="bg-muted/30 border p-12 text-center">
                                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h4 className="text-lg font-medium mb-2">No submissions yet</h4>
                                <p className="text-muted-foreground">
                                    Be the first to submit a response and claim this bounty.
                                </p>
                            </div>) : (
                            <div className="space-y-6">
                                {bounty.submissions
                                    .slice(0, showAllSubmissions ? bounty.submissions.length : 3)
                                    .map((submission, index) => {
                                        const isCollapsed = collapsedSubmissions[index] !== false; // Default to collapsed

                                        return (
                                            <div
                                                key={submission.id || index}
                                                className="bg-background border hover:shadow-md transition-all duration-200 overflow-hidden"
                                            >
                                                {/* Collapsible Header */}
                                                <div
                                                    className="p-6 border-b bg-gradient-to-r from-muted/20 to-transparent cursor-pointer hover:from-muted/30 hover:to-muted/10 transition-all duration-200"
                                                    onClick={() => setCollapsedSubmissions(prev => ({
                                                        ...prev,
                                                        [index]: !prev[index]
                                                    }))}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                                                                <span className="text-sm font-bold text-primary-foreground">
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-lg">Submission #{index + 1}</div>
                                                                <div className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                                                                    {submission.by.slice(0, 12)}...{submission.by.slice(-8)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                                                <Shield className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm font-medium text-green-600">Verified</span>
                                                            </div>
                                                            <div className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}>
                                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Collapsible Content with Animation */}
                                                <div className={`transition-all duration-500 ease-in-out ${isCollapsed
                                                    ? 'max-h-0 opacity-0'
                                                    : 'max-h-[2000px] opacity-100'
                                                    }`}>
                                                    <div className="p-8 space-y-8 bg-gradient-to-b from-muted/5 to-transparent">
                                                        {/* Article */}
                                                        {submission.article && (
                                                            <div>
                                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    Article
                                                                </h4>
                                                                <div className="bg-muted/30 border p-4">
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                        {expandedArticles[index] || submission.article.length <= 300
                                                                            ? submission.article
                                                                            : `${submission.article.slice(0, 300)}...`
                                                                        }
                                                                    </p>
                                                                    {submission.article.length > 300 && (
                                                                        <button
                                                                            className="mt-3 text-sm text-primary hover:underline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setExpandedArticles(prev => ({
                                                                                    ...prev,
                                                                                    [index]: !prev[index]
                                                                                }));
                                                                            }}
                                                                        >
                                                                            {expandedArticles[index] ? "Show less" : "Read more"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Email Evidence */}
                                                        {submission.content && (
                                                            <div>
                                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                    Email Evidence
                                                                </h4>
                                                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
                                                                    <p className="text-sm text-amber-800 dark:text-amber-200 font-mono">
                                                                        {submission.content.length > 150
                                                                            ? `${submission.content.slice(0, 150)}...`
                                                                            : submission.content
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Action Cards in Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        <div className="lg:col-span-2"></div>
                        <div className="space-y-6">
                            {/* Action Button */}
                            {bounty.status === "Tally" && (
                                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Trophy className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                Voting Phase
                                            </span>
                                        </div>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                                            This bounty is in the voting phase. Token holders can vote for submissions to determine winners.
                                        </p>
                                        {canVote && userTokenBalance > 0 && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                You have {userTokenBalance.toFixed(2)} ZL_DAO tokens available for voting.
                                            </p>
                                        )}
                                        {canVote && userTokenBalance === 0 && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                You need ZL_DAO tokens to vote. Participate in the DAO to earn tokens.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {bounty.status === "Closed" && (
                                <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Trophy className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                Bounty Completed
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                            This bounty has been completed and rewards have been distributed to winning submissions.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {canSubmit && (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="pt-6">
                                        <Button
                                            onClick={handleSubmitProof}
                                            className="w-full"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit ZK Proof
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Submit your zero-knowledge proof to claim this bounty
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {isCreator && bounty.status === "Open" && (
                                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                Your Bounty
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                                            You created this bounty. Monitor submissions and award the winner.
                                        </p>
                                        <Button variant="outline" size="sm" className="w-full">
                                            Manage Bounty
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {!currentAccount && bounty.status === "Open" && (
                                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                            Connect your wallet to submit a proof for this bounty.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
