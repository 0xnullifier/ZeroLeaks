import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leakRoutes from './routes/leaks';
import fileRoutes from './routes/files';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
console.log(`Environment: ${process.env.NODE_ENV}`);
app.use(cors({
    origin: process.env.ORIGIN, // Adjust this to your frontend URL
    credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ZeroLeaks API' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/leaks', leakRoutes);
app.use('/api/files', fileRoutes);


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
