import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    Coins,
    Clock,
    User,
    Target,
    Shield,
    Trophy,
    Users,
    AlertTriangle,
    Send
} from "lucide-react";
import { useBountyStore } from "@/lib/bounty-store";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

export function BountyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { getBountyById } = useBountyStore();

    const [bounty, setBounty] = useState(() => getBountyById(id || ""));
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    const canSubmit = currentAccount && !isCreator && bounty.status === "active";
    const timeLeft = new Date(bounty.deadline).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

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
            case "active": return "bg-green-500";
            case "completed": return "bg-blue-500";
            case "expired": return "bg-gray-500";
            case "cancelled": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active": return "Active";
            case "completed": return "Completed";
            case "expired": return "Expired";
            case "cancelled": return "Cancelled";
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
                                        {bounty.category}
                                    </Badge>
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
                                    <CardTitle>Description</CardTitle>
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
                                            <Target className="h-5 w-5" />
                                            Required Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {bounty.requiredInfo}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Verification Criteria */}
                            {bounty.verificationCriteria && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Verification Criteria
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {bounty.verificationCriteria}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Submissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Submissions ({bounty.submissionCount})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {bounty.submissions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                No submissions yet. Be the first to claim this bounty!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bounty.submissions.map((submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {submission.submitter.slice(0, 8)}...{submission.submitter.slice(-6)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {submission.isWinner && (
                                                            <Badge className="bg-amber-500">
                                                                Winner
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant={
                                                                submission.status === "verified" ? "default" :
                                                                    submission.status === "rejected" ? "destructive" :
                                                                        "secondary"
                                                            }
                                                        >
                                                            {submission.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(bounty.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Deadline</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(bounty.deadline).toLocaleDateString()}
                                            </p>
                                            {bounty.status === "active" && (
                                                <p className="text-xs text-amber-600">
                                                    {daysLeft} days left
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Creator Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Creator
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-mono break-all">
                                        {bounty.creator}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Action Button */}
                            {canSubmit && (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="pt-6">
                                        <Button
                                            onClick={handleSubmitProof}
                                            className="w-full"
                                            disabled={isSubmitting}
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

                            {isCreator && bounty.status === "active" && (
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

                            {!currentAccount && bounty.status === "active" && (
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
