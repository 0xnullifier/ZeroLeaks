import { LeakCard } from "./leak-card";

export function LeakList({ leaks, loading = false }: { leaks: any[]; loading?: boolean }) {
  if (loading) {
    // Show 4 skeleton cards
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <LeakCard key={i} loading />
        ))}
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