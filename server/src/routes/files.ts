import express from 'express';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

const router = express.Router();

// Define the files directory
const FILES_DIR = path.join(__dirname, '../../files');

router.get('/', (req: Request, res: Response) => {
    try {
        const files = fs.readdirSync(FILES_DIR);
        res.json({
            files
        });
    } catch (error) {
        console.error('Error reading files directory:', error);
        res.status(500).json({ error: 'Failed to read files directory' });
    }
});

// Route to stream a specific file
router.get('/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(FILES_DIR, filename);
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
    }

    try {
        // Get file stats
        const stat = fs.statSync(filePath);

        // Set appropriate headers
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);

        // Handle potential errors on the stream
        fileStream.on('error', (error) => {
            console.error(`Error streaming file ${filename}:`, error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            } else {
                res.end();
            }
        });

        // Pipe the file stream to the response
        fileStream.pipe(res);
    } catch (error) {
        console.error(`Error serving file ${filename}:`, error);
        res.status(500).json({ error: 'Error serving file' });
    }
});

export default router;
