import { LeakList, LeaksHeader, Sidebar } from "@/components/leaks/leak-page";
import { LEAKS_OBJECT_ID } from "@/lib/constant";
import { useLeaksStore } from "@/lib/leaks-store";
import type { Leak } from "@/lib/types";
import { get } from "@/lib/walrus";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export function LeaksPage() {
  const { loading, setLeaks, getCategories, getAllTags, getFilteredLeaks, setLoading } = useLeaksStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id: LEAKS_OBJECT_ID,
    options: {
      showContent: true,
      showDisplay: true,
    },
  })
  useEffect(() => {
    setLoading(true);
    async function fetchLeaks() {
      try {
        const promises: any[] = [];
        if (data?.data?.content) {
          // @ts-ignore
          const blobIds = data.data.content.fields.blob_ids;
          console.log(data.data.content);
          console.log(blobIds);
          blobIds.forEach((blobId: string) => {
            promises.push(get(blobId));
          });
          const results = await Promise.all(promises);
          const leaks: Leak[] = results.map((result: any, index) => {
            const leak = JSON.parse(new TextDecoder().decode(result));
            return {
              id: index.toString(), // Use index as a temporary ID
              date: leak.date,
              title: leak.title,
              category: leak.category,
              tags: leak.tags,
              summary: leak.summary,
              content: leak.content,
              fromLeakedEmail: leak.fromLeakedEmail || "nothingrn",
              relatedDocuments: leak.documentFiles.map((doc: any) => ({
                name: doc.name,
                content: doc.content, // blob id
              })),
              verificationDigest: leak.transactionDigest,
              proof: leak.zkProof,
              verifiedClaim: leak.verifiedClaim || "",
            }
          })
          setLeaks(leaks.reverse());
        }
      } catch (error) {
        toast("Error fetching the leaks. Please try again later")
      } finally {
        setLoading(false);
      }
    }
    fetchLeaks()
  }, [data, isPending, error, refetch]);

  const categories = getCategories();
  const allTags = getAllTags();
  const filteredLeaks = getFilteredLeaks();

  return (
    <div className="bg-background text-foreground" >
      <main className="container mx-auto px-4 py-8">
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
          <Sidebar
            categories={categories}
            allTags={allTags}
            loading={loading}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="w-full md:w-3/4">
            <LeakList leaks={filteredLeaks} loading={loading} />
          </div>
        </div>
      </main>
    </div >
  );
}
