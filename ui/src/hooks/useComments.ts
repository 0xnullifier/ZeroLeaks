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

    // Add a new comment
    const addComment = async (content: string, author: string, isOP: boolean = false) => {
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
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const data = await response.json();
            setComments(prev => [...prev, data.comment]);
            return data.comment;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
            setError(errorMessage);
            throw new Error(errorMessage);
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
    };
}
