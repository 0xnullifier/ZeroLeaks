import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const STORAGE_FILE = path.join(__dirname, '../../data/objectIds.json');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readObjectIds = (): string[] => {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            return [];
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading object IDs:', error);
        return [];
    }
};

const writeObjectIds = (objectIds: string[]): void => {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(objectIds, null, 2));
    } catch (error) {
        console.error('Error writing object IDs:', error);
        throw error;
    }
};

router.get('/', (req: Request, res: Response) => {
    try {
        const objectIds = readObjectIds();
        const latestFirst = objectIds.reverse();

        res.json({
            message: 'List of all object IDs',
            objectIds: latestFirst,
            count: latestFirst.length
        });
    } catch (error) {
        console.error('Error fetching object IDs:', error);
        res.status(500).json({
            error: 'Failed to fetch object IDs'
        });
    }
});

router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({
        message: `Details of leak with ID: ${id}`,
        leak: { id, title: 'Sample Leak', content: 'This is a sample leak content' }
    });
});

router.post('/', (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!id) {
            res.status(400).json({
                error: 'Object ID is required'
            });
            return;
        }

        const objectIds = readObjectIds();

        if (objectIds.includes(id)) {
            res.status(409).json({
                error: 'Object ID already exists'
            });
            return;
        }

        objectIds.push(id);

        writeObjectIds(objectIds);

        res.status(201).json({
            message: 'Object ID submitted successfully',
            objectId: id,
            totalCount: objectIds.length
        });
    } catch (error) {
        console.error('Error submitting object ID:', error);
        res.status(500).json({
            error: 'Failed to submit object ID'
        });
    }
});

export default router;
