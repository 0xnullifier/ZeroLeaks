import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`Error: ${err.message}`);

    res.status(500).json({
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
        }
    });
};

export const notFound = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(404).json({
        error: {
            message: `Not Found - ${req.originalUrl}`
        }
    });
};

export default {
    errorHandler,
    notFound
};
