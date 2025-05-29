import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Comment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface CommentCardProps {
    comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
    const formatAddress = (address: string) => {
        if (address.length <= 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const timeAgo = formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true });

    return (
        <Card className="bg-card border-border/70">
            <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {comment.author.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-muted-foreground">
                                {formatAddress(comment.author)}
                            </span>
                            {comment.isOP && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    OP
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {timeAgo}
                            </span>
                        </div>
                        <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {comment.content}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
