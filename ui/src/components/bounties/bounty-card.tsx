import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Calendar, Clock, Users, Target } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
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
                    <Skeleton className="h-8 w-1/2 rounded" />
                </CardFooter>
            </Card>
        );
    }

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

    const timeLeft = new Date(bounty.deadline).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    return (
        <Card className="bg-card border-border/70 overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary hover:bg-primary/90">
                            {bounty.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(bounty.status)}`}></div>
                            <span className="text-xs text-muted-foreground">
                                {getStatusText(bounty.status)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 px-2 py-1 rounded-md">
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
                            <div>{new Date(bounty.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <div>
                            <div className="text-xs">
                                {bounty.status === "active" ? "Time left" : "Deadline"}
                            </div>
                            <div className={bounty.status === "active" && daysLeft <= 3 ? "text-red-500 font-medium" : ""}>
                                {bounty.status === "active"
                                    ? `${daysLeft} days`
                                    : new Date(bounty.deadline).toLocaleDateString()
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {bounty.submissionCount > 0 && (
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
                        <span>{bounty.requiredInfo ? "Requirements specified" : "General request"}</span>
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
