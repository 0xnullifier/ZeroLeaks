import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaksHeader({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold">Revealed Categories</h1>
      <Tabs defaultValue="recent" className="w-full sm:w-auto">
        <TabsList className="bg-card">
          <TabsTrigger value="recent">Most Recent</TabsTrigger>
          <TabsTrigger value="popular">Most Viewed</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 