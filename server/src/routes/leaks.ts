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
        const comments = JSON.parse(commentsData);

        res.json({ comments });
    } catch (error) {
        console.error('Error reading comments:', error);
        res.status(500).json({ error: 'Failed to read comments' });
    }
});

// Add a new comment to a leak
router.post('/:leakId/comments', (req: Request, res: Response) => {
    const { leakId } = req.params;
    const { content, author, isOP } = req.body;

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

        const newComment: Comment = {
            id: uuidv4(),
            leakId,
            content,
            author,
            timestamp: new Date().toISOString(),
            isOP: isOP || false
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
