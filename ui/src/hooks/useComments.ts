import { useState, useEffect } from 'react';
import type { Comment } from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useComments(leakId: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch comments for a specific leak
    const fetchComments = async () => {
        if (!leakId) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/leaks/${leakId}/comments`);

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.comments || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    };

    // Add a new comment or reply
    const addComment = async (content: string, author: string, isOP: boolean = false, parentId?: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leaks/${leakId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    author,
                    isOP,
                    parentId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const data = await response.json();

            // Refresh comments to get updated threaded structure
            await fetchComments();

            return data.comment;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Get replies for a specific comment
    const getReplies = async (commentId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leaks/${leakId}/comments/${commentId}/replies`);

            if (!response.ok) {
                throw new Error('Failed to fetch replies');
            }

            const data = await response.json();
            return data.replies || [];
        } catch (err) {
            console.error('Error fetching replies:', err);
            return [];
        }
    };

    // Get comment statistics
    const getCommentStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leaks/${leakId}/comments/stats`);

            if (!response.ok) {
                throw new Error('Failed to fetch comment stats');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error fetching comment stats:', err);
            return { totalComments: 0, topLevelComments: 0, replies: 0 };
        }
    };

    useEffect(() => {
        fetchComments();
    }, [leakId]);

    return {
        comments,
        loading,
        error,
        addComment,
        refetch: fetchComments,
        getReplies,
        getCommentStats,
    };
}
