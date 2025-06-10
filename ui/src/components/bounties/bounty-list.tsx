import { BountyCard } from "./bounty-card";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import type { Bounty } from "@/lib/types";

export function BountyList({ bounties, loading = false }: { bounties: Bounty[]; loading?: boolean }) {
    if (loading) {
        // Show 4 skeleton cards
        return (
            <div className="grid grid-cols-1 gap-6">
                {[...Array(4)].map((_, i) => (
                    <BountyCard key={i} bounty={{} as Bounty} loading />
                ))}
            </div>
        );
    }

    // Empty state
    if (bounties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Card className="max-w-md w-full bg-card border-border/70">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Trophy className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No bounties available</h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            There are currently no bounties matching your filters. Create the first one!
                        </p>
                        <Button asChild className="w-full">
                            <Link to="/bounties/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Bounty
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {bounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
            ))}
        </div>
    );
}
