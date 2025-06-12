import { LeakList, LeaksHeader, Sidebar } from "@/components/leaks/leak-page";
import { LEAKS_OBJECT_ID } from "@/lib/constant";
import { useLeaksStore } from "@/lib/leaks-store";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';


export function LeaksPage() {
  const { loading, setLeaks, getCategories, getAllTags, getFilteredLeaks, fetchLeaks, leaks } = useLeaksStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });


  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id: LEAKS_OBJECT_ID,
    options: {
      showContent: true,
      showDisplay: true,
    },
  })
  useEffect(() => {
    if (leaks.length > 0) return;
    fetchLeaks(data)
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
