import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBountyStore } from "@/lib/bounty-store";

export function BountySidebar({
    categories,
    allTags,
    loading = false,
    isOpen = false,
    onClose,
}: {
    categories: string[];
    allTags: string[];
    loading?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}) {
    const {
        filters,
        setSearchQuery,
        toggleCategory,
        toggleTag,
        toggleStatus,
        setRewardRange,
        setSortBy,
        clearFilters,
    } = useBountyStore();

    if (loading) {
        return (
            <>
                {/* Mobile overlay when open */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}

                {/* Sidebar */}
                <div className={`
          fixed top-0 left-0 h-full w-80 bg-background z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:w-1/4 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
                    {/* Mobile close button */}
                    <div className="flex justify-between items-center p-4 border-b md:hidden">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="p-1"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-4 space-y-6 overflow-y-auto h-full pb-20 md:pb-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>
            </>
        );
    }

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "expired", label: "Expired" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <>
            {/* Mobile overlay when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full w-80 bg-background z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:w-1/4 md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Mobile close button */}
                <div className="flex justify-between items-center p-4 border-b md:hidden">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto h-full pb-20 md:pb-4 md:sticky md:top-22">
                    {/* Search */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Search</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                            <Input
                                type="search"
                                placeholder="Search bounties..."
                                className="pl-8 bg-secondary border-border/60 focus-visible:ring-primary"
                                value={filters.searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Sort By</h2>
                        <Select value={filters.sortBy} onValueChange={(value: any) => setSortBy(value)}>
                            <SelectTrigger className="bg-secondary border-border/60">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="reward_high">Highest Reward</SelectItem>
                                <SelectItem value="reward_low">Lowest Reward</SelectItem>
                                <SelectItem value="deadline">Deadline Soon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Status</h2>
                        <div className="space-y-2">
                            {statusOptions.map((status) => (
                                <div key={status.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`status-${status.value}`}
                                        checked={filters.status.includes(status.value)}
                                        onChange={() => toggleStatus(status.value)}
                                        className="mr-2 h-4 w-4 text-primary focus:ring-primary border-border/60 rounded"
                                    />
                                    <label
                                        htmlFor={`status-${status.value}`}
                                        className="text-sm text-muted-foreground cursor-pointer"
                                    >
                                        {status.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Categories</h2>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`category-${category}`}
                                        checked={filters.selectedCategories.includes(category)}
                                        onChange={() => toggleCategory(category)}
                                        className="mr-2 h-4 w-4 text-primary focus:ring-primary border-border/60 rounded"
                                    />
                                    <label
                                        htmlFor={`category-${category}`}
                                        className="text-sm text-muted-foreground cursor-pointer"
                                    >
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {allTags.slice(0, 15).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors border-border/60 ${filters.selectedTags.includes(tag)
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "hover:bg-primary/20 hover:text-emerald-100"
                                        }`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Reward Range */}
                    <div className="bg-card rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4">Reward Range (SUI)</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{filters.minReward}</span>
                                <span>{filters.maxReward}</span>
                            </div>
                            <Slider
                                value={[filters.minReward, filters.maxReward]}
                                onValueChange={([min, max]) => setRewardRange(min, max)}
                                max={1000}
                                min={0}
                                step={10}
                                className="w-full"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="min-reward" className="text-xs">Min</Label>
                                    <Input
                                        id="min-reward"
                                        type="number"
                                        value={filters.minReward}
                                        onChange={(e) => setRewardRange(parseInt(e.target.value) || 0, filters.maxReward)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="max-reward" className="text-xs">Max</Label>
                                    <Input
                                        id="max-reward"
                                        type="number"
                                        value={filters.maxReward}
                                        onChange={(e) => setRewardRange(filters.minReward, parseInt(e.target.value) || 1000)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
