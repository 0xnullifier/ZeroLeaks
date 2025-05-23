import { LeakList, LeaksHeader, Sidebar } from "@/components/leaks/leak-page";
import { LEAKS } from "@/lib/data/leaks";

export function LeaksPage() {
  const leaks = LEAKS;
  const categories = Array.from(new Set(leaks.map((leak) => leak.category)));
  // All unique tags from the leaks
  const allTags = Array.from(new Set(leaks.flatMap((leak) => leak.tags)));

  // Simulate loading state (set to true to see skeletons)
  const loading = false;

  return (
    <div className="bg-background text-foreground">
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <Sidebar categories={categories} allTags={allTags} loading={loading} />
        <div className="w-full md:w-3/4">
          <LeaksHeader loading={loading} />
          <LeakList leaks={leaks} loading={loading} />
        </div>
      </div>
    </main>
  </div>
  );
}
