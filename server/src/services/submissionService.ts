import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface LeakSubmission {
    id: string;
    blobId: string;
    transactionDigest: string;
    title: string;
    author: string;
    category: string;
    timestamp: string;
    verified: boolean;
}

const SUBMISSIONS_DIR = path.join(__dirname, '../../data/submissions');
const SUBMISSIONS_FILE = path.join(SUBMISSIONS_DIR, 'leaks.json');

// Ensure submissions directory exists
if (!fs.existsSync(SUBMISSIONS_DIR)) {
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

export class SubmissionService {
    static async storeSubmission(data: {
        blobId: string;
        transactionDigest: string;
        title?: string;
        author?: string;
        category?: string;
        timestamp?: string;
    }): Promise<LeakSubmission> {
        let submissions: LeakSubmission[] = [];

        // Read existing submissions if file exists
        if (fs.existsSync(SUBMISSIONS_FILE)) {
            const submissionsData = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
            submissions = JSON.parse(submissionsData);
        }

        const newSubmission: LeakSubmission = {
            id: uuidv4(),
            blobId: data.blobId,
            transactionDigest: data.transactionDigest,
            title: data.title || 'Untitled Leak',
            author: data.author || 'Anonymous',
            category: data.category || 'Other',
            timestamp: data.timestamp || new Date().toISOString(),
            verified: true // Since it's stored on-chain with proof verification
        };

        submissions.push(newSubmission);

        // Write updated submissions back to file
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

        return newSubmission;
    }

    static async getAllSubmissions(): Promise<LeakSubmission[]> {
        if (!fs.existsSync(SUBMISSIONS_FILE)) {
            return [];
        }

        const submissionsData = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
        return JSON.parse(submissionsData);
    }

    static async getSubmissionByBlobId(blobId: string): Promise<LeakSubmission | null> {
        const submissions = await this.getAllSubmissions();
        return submissions.find(sub => sub.blobId === blobId) || null;
    }

    static async getSubmissionByTransactionDigest(digest: string): Promise<LeakSubmission | null> {
        const submissions = await this.getAllSubmissions();
        return submissions.find(sub => sub.transactionDigest === digest) || null;
    }

    static async getSubmissionsByAuthor(author: string): Promise<LeakSubmission[]> {
        const submissions = await this.getAllSubmissions();
        return submissions.filter(sub => sub.author === author);
    }

    static async getSubmissionsByCategory(category: string): Promise<LeakSubmission[]> {
        const submissions = await this.getAllSubmissions();
        return submissions.filter(sub => sub.category === category);
    }
}
