import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('Unhandled error', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });
};
