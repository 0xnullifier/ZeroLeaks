import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    BarChart3,
    Target,
    Users,
    Vote,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import type { Proposal } from "@/pages/dao";

interface VotingStatsProps {
    proposals: Proposal[];
}

export function VotingStats({ proposals }: VotingStatsProps) {
    const activeProposals = proposals.filter(p => p.status === "active");
    const passedProposals = proposals.filter(p => p.status === "passed");
    const rejectedProposals = proposals.filter(p => p.status === "rejected");

    const totalVotes = proposals.reduce((sum, p) => sum + p.totalVotes, 0);
    const averageParticipation = proposals.length > 0
        ? proposals.reduce((sum, p) => sum + (p.totalVotes / p.requiredVotes), 0) / proposals.length * 100
        : 0;

    const accessGrantProposals = proposals.filter(p => p.category === "access_grant");
    const governanceProposals = proposals.filter(p => p.category === "governance");

    const passRate = proposals.length > 0
        ? (passedProposals.length / proposals.filter(p => p.status !== "active").length) * 100
        : 0;

    const mostActiveProposal = proposals.reduce((max, proposal) =>
        proposal.totalVotes > (max?.totalVotes || 0) ? proposal : max,
        null as Proposal | null
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Voting Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Total Participation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Total Votes Cast</span>
                            <span className="text-muted-foreground">{totalVotes.toLocaleString()}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{totalVotes.toLocaleString()}</div>
                    </div>

                    {/* Average Participation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Avg. Participation</span>
                            <span className="text-muted-foreground">{averageParticipation.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(averageParticipation, 100)} className="h-2" />
                    </div>

                    {/* Pass Rate */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">Pass Rate</span>
                            <span className="text-muted-foreground">{passRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={passRate} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Proposal Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Breakdown */}
                    <div>
                        <h4 className="font-medium mb-3 text-sm">By Status</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Active</span>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300">
                                    {activeProposals.length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Passed</span>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300">
                                    {passedProposals.length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">Rejected</span>
                                </div>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300">
                                    {rejectedProposals.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div>
                        <h4 className="font-medium mb-3 text-sm">By Category</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Access Grants</span>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300">
                                    {accessGrantProposals.length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Governance</span>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300">
                                    {governanceProposals.length}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Most Active Proposal */}
            {mostActiveProposal && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            Most Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm leading-tight">
                                {mostActiveProposal.title.length > 50
                                    ? `${mostActiveProposal.title.substring(0, 50)}...`
                                    : mostActiveProposal.title
                                }
                            </h4>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Votes</span>
                                <div className="flex items-center gap-1">
                                    <Vote className="h-3 w-3" />
                                    <span className="font-medium">{mostActiveProposal.totalVotes.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>For: {mostActiveProposal.votesFor.toLocaleString()}</span>
                                    <span>Against: {mostActiveProposal.votesAgainst.toLocaleString()}</span>
                                </div>
                                <Progress
                                    value={(mostActiveProposal.votesFor / Math.max(mostActiveProposal.totalVotes, 1)) * 100}
                                    className="h-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{proposals.length}</div>
                            <div className="text-muted-foreground">Total Proposals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{passedProposals.length}</div>
                            <div className="text-muted-foreground">Approved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{rejectedProposals.length}</div>
                            <div className="text-muted-foreground">Rejected</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">{activeProposals.length}</div>
                            <div className="text-muted-foreground">Active</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
