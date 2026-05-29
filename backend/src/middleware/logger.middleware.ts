import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
};
