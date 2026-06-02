import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled error', { message: err.message, stack: err.stack?.slice(0, 300) });
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    retryable: false,
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND', retryable: false });
}
