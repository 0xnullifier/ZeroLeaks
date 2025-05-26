import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Calendar, FileCheck } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import type { Leak } from "@/lib/types";

export function LeakCard({ leak, loading = false }: { leak: Leak; loading?: boolean }) {
  if (loading || !leak) {
    return (
      <Card className="bg-card border-border/70 overflow-hidden">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-6 w-2/3 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-6 w-12 rounded" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-4">
          <Skeleton className="h-8 w-1/2 rounded" />
        </CardFooter>
      </Card>
    );
  }
  return (
    <Card className="bg-card border-border/70 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className="mb-2 bg-primary hover:bg-primary/90">
            {leak.category}
          </Badge>
        </div>
        <CardTitle className="text-xl">
          <Link
            to={`/leaks/${leak.id}`}
            className="hover:text-primary/80 transition-colors"
          >
            {leak.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{leak.summary}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {leak.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/60 text-muted-foreground"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-muted-foreground/70 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <time dateTime={leak.date}>
            {new Date(leak.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/70 pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-primary">
            <FileCheck className="h-4 w-4 mr-1" />
            <span className="text-sm">Verified</span>
          </div>
          <Button variant="ghost" asChild>
            <Link to={`/leaks/${leak.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 