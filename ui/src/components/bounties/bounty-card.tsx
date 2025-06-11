import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Calendar, Clock, Users, Target } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatDeadlineWithTimeLeft } from "@/lib/utils";
import type { Bounty } from "@/lib/types";

export function BountyCard({ bounty, loading = false }: { bounty: Bounty; loading?: boolean }) {
    if (loading) {
        return (
            <Card className="bg-card border-border/70 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-6 w-20 mb-2" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-6 w-16" />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
                <CardFooter className="pt-2">
                    <Skeleton className="h-8 w-1/2" />
                </CardFooter>
            </Card>
        );
    }

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

    const deadlineInfo = formatDeadlineWithTimeLeft(bounty.deadline, bounty.status);

    return (
        <Card className="bg-card border-border/70 overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary hover:bg-primary/90">
                            {bounty.category[0] || "General"}
                        </Badge>
                        {bounty.category.length > 1 && (
                            <Badge variant="outline" className="text-xs">
                                +{bounty.category.length - 1} more
                            </Badge>
                        )}
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(bounty.status)}`}></div>
                            <span className="text-xs text-muted-foreground">
                                {getStatusText(bounty.status)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 px-2 py-1">
                        <Coins className="h-3 w-3 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                            {bounty.reward} SUI
                        </span>
                    </div>
                </div>
                <CardTitle className="text-xl">
                    <Link
                        to={`/bounties/${bounty.id}`}
                        className="hover:text-primary/80 transition-colors"
                    >
                        {bounty.title}
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">{bounty.description}</p>

                {/* Required Information Preview */}
                {bounty.requiredInfo && (
                    <div className="mb-4 p-3 bg-muted/30">
                        <h4 className="text-xs font-medium text-foreground mb-1">Required Information:</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {bounty.requiredInfo}
                        </p>
                    </div>
                )}

                {/* Verification Criteria Preview */}
                {bounty.verificationCriteria && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <h4 className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Verification Criteria:</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2">
                            {bounty.verificationCriteria}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                    {bounty.tags.slice(0, 3).map((tag) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-border/70 text-muted-foreground"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {bounty.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-border/70 text-muted-foreground">
                            +{bounty.tags.length - 3} more
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <div>
                            <div className="text-xs">Created</div>
                            <div>{formatDateTime(bounty.createdAt, { showTime: false })}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <div>
                            <div className="text-xs">
                                {bounty.status === "Open" ? "Time left" : "Deadline"}
                            </div>
                            <div className={bounty.status === "Open" && deadlineInfo.isExpired ? "text-red-500 font-medium" : ""}>
                                {bounty.status === "Open"
                                    ? deadlineInfo.timeLeft
                                    : formatDateTime(bounty.deadline, { showTime: false })
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {(bounty.submissionCount ?? 0) > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {bounty.submissionCount} submission{bounty.submissionCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{bounty.numberOfRewards} reward{bounty.numberOfRewards !== 1 ? 's' : ''} available</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={`/bounties/${bounty.id}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
