import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LeakDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main content skeleton */}
                    <div className="w-full md:w-2/3">
                        <div className="mb-6">
                            {/* Breadcrumb skeleton */}
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Skeleton className="h-4 w-12" />
                                <span>/</span>
                                <Skeleton className="h-4 w-16" />
                            </div>

                            {/* Title skeleton */}
                            <Skeleton className="h-10 w-3/4 mb-4" />

                            {/* Tags skeleton */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-24" />
                            </div>

                            {/* Meta info skeleton */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Content skeleton */}
                            <div className="space-y-4 mb-8">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>

                            {/* Related documents skeleton */}
                            <div className="mb-8">
                                <Skeleton className="h-6 w-40 mb-4" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-card rounded-lg p-3 border border-border/70"
                                        >
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-8 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action buttons skeleton */}
                            <div className="flex flex-wrap gap-4 justify-between items-center">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-20" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar skeleton */}
                    <div className="w-full md:w-1/3 space-y-6">
                        {/* Blockchain Verification Card skeleton */}
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <div className="bg-white dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Source Information Card skeleton */}
                        <Card className="bg-card border-border/70">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-2 h-2 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-2 h-2 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>

                                <div className="my-4">
                                    <Skeleton className="h-px w-full" />
                                </div>

                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-16" />
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Comments Section skeleton */}
                <div className="mt-8">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
