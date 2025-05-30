import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Comment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentForm } from "./CommentForm";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface ThreadedCommentProps {
    comment: Comment;
    onReply: (content: string, author: string, isOP: boolean, parentId: string) => Promise<void>;
    originalPosterAddress?: string;
    depth?: number;
    maxDepth?: number;
}

export function ThreadedComment({
    comment,
    onReply,
    originalPosterAddress,
    depth = 0,
    maxDepth = 3
}: ThreadedCommentProps) {
    const [showReplies, setShowReplies] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const account = useCurrentAccount();

    const formatAddress = (address: string) => {
        if (address.length <= 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const timeAgo = formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true });
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleReply = async (content: string) => {
        if (!account?.address) {
            throw new Error("Please connect your wallet to reply");
        }

        const isOP = originalPosterAddress === account.address;
        await onReply(content, account.address, isOP, comment.id);
        setIsReplying(false);
    };

    return (
        <div className={cn("space-y-3", depth > 0 && "ml-4 pl-4 border-l border-border/30")}>
            {/* Main Comment */}
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

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="text-muted-foreground hover:text-foreground h-7 px-2"
                                >
                                    <Reply className="h-3 w-3 mr-1" />
                                    Reply
                                </Button>

                                {hasReplies && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReplies(!showReplies)}
                                        className="text-muted-foreground hover:text-foreground h-7 px-2"
                                    >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                        {showReplies ? (
                                            <ChevronUp className="h-3 w-3 ml-1" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reply Form */}
            {isReplying && (
                <div className="ml-11">
                    <CommentForm
                        onSubmit={handleReply}
                        originalPosterAddress={originalPosterAddress}
                        placeholder={`Reply to ${formatAddress(comment.author)}...`}
                        compact={true}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Nested Replies */}
            {hasReplies && showReplies && (
                <div className="space-y-3">
                    {comment.replies!.map((reply) => (
                        <ThreadedComment
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            originalPosterAddress={originalPosterAddress}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
