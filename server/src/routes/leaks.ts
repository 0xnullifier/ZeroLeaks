import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'List of all leaks',
        leaks: []
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Details of leak with ID: ${id}`,
        leak: { id, title: 'Sample Leak', content: 'This is a sample leak content' }
    });
});

router.post('/', (req, res) => {
    const { title, content } = req.body;


    res.status(201).json({
        message: 'Leak submitted successfully',
        leak: { id: 'new-id', title, content }
    });
});

export default router;
