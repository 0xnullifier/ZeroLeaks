import { LeakList, LeaksHeader, Sidebar } from "@/components/leaks/leak-page";
import { LEAKS_OBJECT_ID } from "@/lib/constant";
import { useLeaksStore } from "@/lib/leaks-store";
import type { Leak } from "@/lib/types";
import { get } from "@/lib/walrus";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect } from "react";

export function LeaksPage() {
  const { loading, setLeaks, getCategories, getAllTags, getFilteredLeaks } = useLeaksStore();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id: LEAKS_OBJECT_ID,
    options: {
      showContent: true,
      showDisplay: true,
    },
  })
  useEffect(() => {
    async function fetchLeaks() {
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
        setLeaks(leaks);
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
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <Sidebar categories={categories} allTags={allTags} loading={loading} />
          <div className="w-full md:w-3/4">
            <LeakList leaks={filteredLeaks} loading={loading} />
          </div>
        </div>
      </main>
    </div >
  );
}
