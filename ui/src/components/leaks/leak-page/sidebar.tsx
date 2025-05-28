import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { useLeaksStore } from "@/lib/leaks-store";
import { useState } from "react";

export function Sidebar({
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
    setSelectedCategory,
    toggleTag,
    setDateRange,
    clearFilters
  } = useLeaksStore();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const handleApplyFilters = () => {
    const fromDateString = dateFrom ? dateFrom.toISOString().split('T')[0] : "";
    const toDateString = dateTo ? dateTo.toISOString().split('T')[0] : "";
    setDateRange(fromDateString, toDateString);
  };

  const handleClearFilters = () => {
    clearFilters();
    setDateFrom(undefined);
    setDateTo(undefined);
  };
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
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </>
    );
  }
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
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Search</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                type="search"
                placeholder="Search leaks..."
                className="pl-8 bg-secondary border-border/60 focus-visible:ring-primary"
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Categories</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="category-all"
                  name="category"
                  className="mr-2 accent-primary"
                  checked={filters.selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                />
                <label htmlFor="category-all" className="text-muted-foreground">
                  All Categories
                </label>
              </div>
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="radio"
                    id={`category-${category}`}
                    name="category"
                    className="mr-2 accent-primary"
                    checked={filters.selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-muted-foreground"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
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
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Date Range</h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="from-date"
                  className="block text-sm text-muted-foreground mb-1"
                >
                  From
                </label>
                <DatePicker
                  date={dateFrom}
                  setDate={setDateFrom}
                  className="bg-secondary border-border/60 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="to-date"
                  className="block text-sm text-muted-foreground mb-1"
                >
                  To
                </label>
                <DatePicker
                  date={dateTo}
                  setDate={setDateTo}
                  className="bg-secondary border-border/60 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 