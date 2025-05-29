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

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import axios from "axios";


export function LeaksPage() {
  const { loading, setLeaks, getCategories, getAllTags, getFilteredLeaks, setLoading } = useLeaksStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient,
  });

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
      console.log(data)
      try {
        if (data?.data?.content) {
          // @ts-ignore
          const blobIds = data.data.content.fields.info.map((info: any) => info.fields.blob_id);
          // @ts-ignore
          const info = data.data.content.fields.info;

          // Create promises for blob content and transaction data
          const blobPromises = blobIds.map((blobId: string) => get(blobId));
          const transactionPromises = blobIds.map((blobId: string) =>
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leaks/submissions/${blobId}`)
          );

          // Use Promise.allSettled to handle individual failures gracefully
          const [blobResults, txResults] = await Promise.all([
            Promise.allSettled(blobPromises),
            Promise.allSettled(transactionPromises)
          ]);

          console.log('Blob results:', blobResults);
          console.log('Transaction results:', txResults);

          const leaks: Leak[] = [];
          let failedCount = 0;

          // Process each result individually
          for (let index = 0; index < blobIds.length; index++) {
            const blobResult = blobResults[index];
            const txResult = txResults[index];
            try {
              // Check if both blob and transaction fetch succeeded
              if (blobResult.status === 'fulfilled' && txResult.status === 'fulfilled') {
                const leak = JSON.parse(new TextDecoder().decode(blobResult.value));
                console.log(txResult)
                leaks.push({
                  id: blobIds[index],
                  date: leak.date,
                  title: leak.title,
                  category: leak.category,
                  tags: leak.tags,
                  summary: leak.summary,
                  content: leak.content,
                  fromLeakedEmail: leak.fromLeakedEmail || "nothingrn",
                  relatedDocuments: leak.documentFiles?.map((doc: any) => ({
                    name: doc.name,
                    content: doc.content, // blob id
                  })) || [],
                  verificationDigest: txResult.value.data.submission.transactionDigest,
                  proof: leak.zkProof,
                  verifiedClaim: info[index].fields.content || "cannot get the claim",
                });
              } else {
                // Log individual failures for debugging
                if (blobResult.status === 'rejected') {
                  console.error(`Failed to fetch blob ${blobIds[index]}:`, blobResult.reason);
                }
                if (txResult.status === 'rejected') {
                  console.error(`Failed to fetch transaction for ${blobIds[index]}:`, txResult.reason);
                }
                failedCount++;
              }
            } catch (parseError) {
              console.error(`Error processing leak ${blobIds[index]}:`, parseError);
              failedCount++;
            }
          }

          setLeaks(leaks.reverse());

          // Show a toast if some items failed but others succeeded
          if (failedCount > 0 && leaks.length > 0) {
            toast(`${leaks.length} leaks loaded successfully. ${failedCount} items failed to load.`);
          } else if (failedCount > 0 && leaks.length === 0) {
            toast("All leaks failed to load. Please try again later.");
          }
        }
      } catch (error) {
        console.error('Error in fetchLeaks:', error);
        toast("Error fetching the leaks. Please try again later");
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
