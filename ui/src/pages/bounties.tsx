import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { useBountyStore } from "@/lib/bounty-store";
import { BountySidebar } from "@/components/bounties/bounty-sidebar";
import { BountyList } from "@/components/bounties/bounty-list";
import { Link } from "react-router";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { BOUNTIES_OBJECT_ID } from "@/lib/constant";

export function BountiesPage() {
    const {
        loading,
        error,
        getCategories,
        getAllTags,
        getFilteredBounties,
        fetchBounties,
        clearError
    } = useBountyStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch bounties data from blockchain
    const { data: bountiesData, isLoading: isLoadingBounties } = useSuiClientQuery(
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

    console.log(bountiesData)

    useEffect(() => {
        if (bountiesData) {
            // Use the store's fetchBounties method to handle data parsing
            fetchBounties(bountiesData);
        }
    }, [bountiesData, fetchBounties]);

    const categories = getCategories();
    const allTags = getAllTags();
    const filteredBounties = getFilteredBounties();
    const isLoading = loading || isLoadingBounties;

    // Show error state if there's an error
    if (error) {
        return (
            <div className="bg-background text-foreground">
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-4">Error loading bounties: {error}</p>
                        <Button onClick={clearError} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Information Bounties</h1>
                        <p className="text-muted-foreground">
                            Discover and claim rewards for verified information leaks
                        </p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link to="/bounties/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Bounty
                        </Link>
                    </Button>
                </div>

                {/* Mobile Filter Button */}
                <div className="mb-4 md:hidden">
                    <Button
                        onClick={() => setIsSidebarOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <BountySidebar
                        categories={categories}
                        allTags={allTags}
                        loading={isLoading}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                    <div className="w-full md:w-3/4">
                        <BountyList bounties={filteredBounties} loading={isLoading} />
                    </div>
                </div>
            </main>
        </div>
    );
}
