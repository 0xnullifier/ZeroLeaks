import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Sidebar({
  categories,
  allTags,
  loading = false,
}: {
  categories: string[];
  allTags: string[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="w-full md:w-1/4 space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }
  return (
    <div className="w-full md:w-1/4 space-y-6 sticky top-22">
      <div className="bg-card rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Search</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Search leaks..."
            className="pl-8 bg-secondary border-border/60 focus-visible:ring-primary"
          />
        </div>
      </div>
      <div className="bg-card rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <input
                type="radio"
                id={`category-${category}`}
                name="category"
                className="mr-2 accent-primary"
                defaultChecked={category === "all"}
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
              variant="outline"
              className="cursor-pointer hover:bg-primary/20 hover:text-emerald-100 border-border/60"
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
            <Input
              type="date"
              id="from-date"
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
            <Input
              type="date"
              id="to-date"
              className="bg-secondary border-border/60 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>
      <Button className="w-full bg-primary hover:bg-primary/90">Apply Filters</Button>
    </div>
  );
} 