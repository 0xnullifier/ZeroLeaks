import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
    onSubmit: (content: string, author: string, isOP: boolean) => Promise<void>;
    originalPosterAddress?: string;
}

export function CommentForm({ onSubmit, originalPosterAddress }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const account = useCurrentAccount();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast("Please connect your wallet to comment", {
                position: "top-right",
            });
            return;
        }

        if (!content.trim()) {
            toast("Please enter a comment", {
                position: "top-right",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            const isOP = account.address === originalPosterAddress;
            await onSubmit(content.trim(), account.address, isOP);
            setContent("");
            toast("Comment added successfully", {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error submitting comment:", error);
            toast("Failed to add comment", {
                position: "top-right",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!account) {
        return (
            <Card className="bg-card border-border/70">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <p className="mb-4">Connect your wallet to join the discussion</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border-border/70">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="Share your thoughts about this leak..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[100px] resize-none"
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                            Commenting as: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                            {account.address === originalPosterAddress && (
                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">(Original Poster)</span>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="min-w-[100px]"
                        >
                            {isSubmitting ? (
                                "Posting..."
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
