import { LeakCard } from "./leak-card";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import type { Leak } from "@/lib/types";

export function LeakList({ leaks, loading = false }: { leaks: Leak[]; loading?: boolean }) {
  if (loading) {
    // Show 4 skeleton cards
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <LeakCard key={i} leak={{} as Leak} loading />
        ))}
      </div>
    );
  }

  // Empty state
  if (leaks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Card className="max-w-md w-full bg-card border-border/70">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No leaks available</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              There are currently no verified leaks to display. Be the first to submit a secure leak.
            </p>
            <Button asChild className="w-full">
              <Link to="/leaks/submit">
                <Plus className="h-4 w-4 mr-2" />
                Submit a Leak
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {leaks.map((leak) => (
        <LeakCard key={leak.id} leak={leak} />
      ))}
    </div>
  );
} 