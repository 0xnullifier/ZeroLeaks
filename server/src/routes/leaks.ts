import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SubmissionService } from '../services/submissionService';

const router = express.Router();

// Define the comments directory
const COMMENTS_DIR = path.join(__dirname, '../../data/comments');

// Ensure comments directory exists
if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true });
}

interface Comment {
    id: string;
    leakId: string;
    content: string;
    author: string; // wallet address
    timestamp: string;
    isOP: boolean; // true if this is the original poster
    parentId?: string; // null for top-level comments, comment ID for replies
    replies?: Comment[]; // nested replies (computed when fetching)
    replyCount?: number; // number of direct replies
}

// Helper function to organize comments into threaded structure
function organizeCommentsIntoThreads(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const topLevelComments: Comment[] = [];

    // First pass: create a map of all comments and initialize replies array
    comments.forEach(comment => {
        comment.replies = [];
        comment.replyCount = 0;
        commentMap.set(comment.id, comment);
    });

    // Second pass: organize into threads
    comments.forEach(comment => {
        if (comment.parentId) {
            // This is a reply to another comment
            const parentComment = commentMap.get(comment.parentId);
            if (parentComment) {
                parentComment.replies!.push(comment);
                parentComment.replyCount = (parentComment.replyCount || 0) + 1;
            } else {
                // Parent not found, treat as top-level comment
                topLevelComments.push(comment);
            }
        } else {
            // This is a top-level comment
            topLevelComments.push(comment);
        }
    });

    // Sort top-level comments by timestamp (newest first)
    topLevelComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Sort replies within each thread by timestamp (oldest first for better conversation flow)
    function sortReplies(comment: Comment) {
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            comment.replies.forEach(sortReplies); // Recursively sort nested replies
        }
    }

    topLevelComments.forEach(sortReplies);

    return topLevelComments;
}

// Get comments for a specific leak
router.get('/:leakId/comments', (req: Request, res: Response) => {
    const { leakId } = req.params;
    const commentsFile = path.join(COMMENTS_DIR, `${leakId}.json`);

    try {
        if (!fs.existsSync(commentsFile)) {
            res.json({ comments: [] });
            return;
        }

        const commentsData = fs.readFileSync(commentsFile, 'utf8');
        const allComments = JSON.parse(commentsData);

        // Organize comments into threaded structure
        const threadedComments = organizeCommentsIntoThreads(allComments);

        res.json({ comments: threadedComments });
    } catch (error) {
        console.error('Error reading comments:', error);
        res.status(500).json({ error: 'Failed to read comments' });
    }
});

// Add a new comment to a leak (supports replies)
router.post('/:leakId/comments', (req: Request, res: Response) => {
    const { leakId } = req.params;
    const { content, author, isOP, parentId } = req.body;

    if (!content || !author) {
        res.status(400).json({ error: 'Content and author are required' });
        return;
    }

    const commentsFile = path.join(COMMENTS_DIR, `${leakId}.json`);

    try {
        let comments: Comment[] = [];

        // Read existing comments if file exists
        if (fs.existsSync(commentsFile)) {
            const commentsData = fs.readFileSync(commentsFile, 'utf8');
            comments = JSON.parse(commentsData);
        }

        // If parentId is provided, verify that the parent comment exists
        if (parentId) {
            const parentExists = comments.some(comment => comment.id === parentId);
            if (!parentExists) {
                res.status(400).json({ error: 'Parent comment not found' });
                return;
            }
        }

        const newComment: Comment = {
            id: uuidv4(),
            leakId,
            content,
            author,
            timestamp: new Date().toISOString(),
            isOP: isOP || false,
            parentId: parentId || undefined
        };

        comments.push(newComment);

        // Write updated comments back to file
        fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));

        res.status(201).json({ comment: newComment });
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

// Get replies for a specific comment
router.get('/:leakId/comments/:commentId/replies', (req: Request, res: Response) => {
    const { leakId, commentId } = req.params;
    const commentsFile = path.join(COMMENTS_DIR, `${leakId}.json`);

    try {
        if (!fs.existsSync(commentsFile)) {
            res.json({ replies: [] });
            return;
        }

        const commentsData = fs.readFileSync(commentsFile, 'utf8');
        const allComments = JSON.parse(commentsData);

        // Find all replies to the specific comment
        const replies = allComments.filter((comment: Comment) => comment.parentId === commentId);

        // Sort replies by timestamp (oldest first for conversation flow)
        replies.sort((a: Comment, b: Comment) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        res.json({ replies });
    } catch (error) {
        console.error('Error reading comment replies:', error);
        res.status(500).json({ error: 'Failed to read comment replies' });
    }
});

// Get a specific comment by ID
router.get('/:leakId/comments/:commentId', (req: Request, res: Response) => {
    const { leakId, commentId } = req.params;
    const commentsFile = path.join(COMMENTS_DIR, `${leakId}.json`);

    try {
        if (!fs.existsSync(commentsFile)) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        const commentsData = fs.readFileSync(commentsFile, 'utf8');
        const allComments = JSON.parse(commentsData);

        const comment = allComments.find((c: Comment) => c.id === commentId);

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // Get replies for this comment
        const replies = allComments.filter((c: Comment) => c.parentId === commentId);
        comment.replies = replies.sort((a: Comment, b: Comment) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        comment.replyCount = replies.length;

        res.json({ comment });
    } catch (error) {
        console.error('Error reading comment:', error);
        res.status(500).json({ error: 'Failed to read comment' });
    }
});

// Get comment statistics for a leak
router.get('/:leakId/comments/stats', (req: Request, res: Response) => {
    const { leakId } = req.params;
    const commentsFile = path.join(COMMENTS_DIR, `${leakId}.json`);

    try {
        if (!fs.existsSync(commentsFile)) {
            res.json({
                totalComments: 0,
                topLevelComments: 0,
                replies: 0
            });
            return;
        }

        const commentsData = fs.readFileSync(commentsFile, 'utf8');
        const allComments = JSON.parse(commentsData);

        const topLevelComments = allComments.filter((comment: Comment) => !comment.parentId);
        const replies = allComments.filter((comment: Comment) => comment.parentId);

        res.json({
            totalComments: allComments.length,
            topLevelComments: topLevelComments.length,
            replies: replies.length
        });
    } catch (error) {
        console.error('Error reading comment statistics:', error);
        res.status(500).json({ error: 'Failed to read comment statistics' });
    }
});

// Store leak submission data
router.post('/submissions', async (req: Request, res: Response) => {
    const { blobId, transactionDigest, title, author, category, timestamp } = req.body;

    if (!blobId || !transactionDigest) {
        res.status(400).json({ error: 'BlobId and transactionDigest are required' });
        return;
    }

    try {
        const submission = await SubmissionService.storeSubmission({
            blobId,
            transactionDigest,
            title,
            author,
            category,
            timestamp
        });

        res.status(201).json({
            message: 'Leak submission stored successfully',
            submission
        });
    } catch (error) {
        console.error('Error storing leak submission:', error);
        res.status(500).json({ error: 'Failed to store leak submission' });
    }
});

// Get all leak submissions
router.get('/submissions', async (req: Request, res: Response) => {
    try {
        const submissions = await SubmissionService.getAllSubmissions();
        res.json({ submissions });
    } catch (error) {
        console.error('Error reading leak submissions:', error);
        res.status(500).json({ error: 'Failed to read leak submissions' });
    }
});

// Get leak submission by blob ID
router.get('/submissions/:blobId', async (req: Request, res: Response) => {
    const { blobId } = req.params;
    console.log('Reading leak submission for blobId:', blobId);
    try {
        const submission = await SubmissionService.getSubmissionByBlobId(blobId);

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        res.json({ submission });
    } catch (error) {
        console.error('Error reading leak submission:', error);
        res.status(500).json({ error: 'Failed to read leak submission' });
    }
});

// Get leak submissions by author
router.get('/submissions/author/:author', async (req: Request, res: Response) => {
    const { author } = req.params;

    try {
        const submissions = await SubmissionService.getSubmissionsByAuthor(author);
        res.json({ submissions });
    } catch (error) {
        console.error('Error reading leak submissions by author:', error);
        res.status(500).json({ error: 'Failed to read leak submissions' });
    }
});

// Get leak submissions by category
router.get('/submissions/category/:category', async (req: Request, res: Response) => {
    const { category } = req.params;

    try {
        const submissions = await SubmissionService.getSubmissionsByCategory(category);
        res.json({ submissions });
    } catch (error) {
        console.error('Error reading leak submissions by category:', error);
        res.status(500).json({ error: 'Failed to read leak submissions' });
    }
});

// Get leak submission by transaction digest
router.get('/submissions/transaction/:digest', async (req: Request, res: Response) => {
    const { digest } = req.params;

    try {
        const submission = await SubmissionService.getSubmissionByTransactionDigest(digest);

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        res.json({ submission });
    } catch (error) {
        console.error('Error reading leak submission by transaction digest:', error);
        res.status(500).json({ error: 'Failed to read leak submission' });
    }
});

export default router;
