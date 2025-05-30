import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { ThreadedComment } from "./ThreadedComment";
import { CommentForm } from "./CommentForm";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { Leak } from "@/lib/types";

interface CommentsSectionProps {
    leak: Leak;
}

export function CommentsSection({ leak }: CommentsSectionProps) {
    const account = useCurrentAccount();
    const { comments, loading, error, addComment } = useComments(leak.id);

    const handleAddComment = async (content: string) => {
        if (!account?.address) {
            throw new Error("Please connect your wallet to comment");
        }

        // Check if this user is the original poster
        const isOP = leak.author === account.address;

        await addComment(content, account.address, isOP);
    };

    const handleReply = async (content: string, author: string, isOP: boolean, parentId: string) => {
        await addComment(content, author, isOP, parentId);
    };

    // Count total comments including replies
    const countTotalComments = (comments: any[]): number => {
        return comments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? countTotalComments(comment.replies) : 0);
        }, 0);
    };

    const totalComments = countTotalComments(comments);

    return (
        <Card className="bg-card border-border/70">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({totalComments})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Comment Form */}
                <CommentForm onSubmit={handleAddComment} />

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                    {loading && (
                        <div className="text-center text-muted-foreground py-4">
                            Loading comments...
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-500 py-4">
                            Error loading comments: {error}
                        </div>
                    )}

                    {!loading && !error && comments.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No comments yet. Be the first to comment!
                        </div>
                    )}

                    {!loading && !error && comments.length > 0 && (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <ThreadedComment
                                    key={comment.id}
                                    comment={comment}
                                    onReply={handleReply}
                                    originalPosterAddress={leak.author}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
