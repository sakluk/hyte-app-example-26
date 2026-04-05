import type {Request, Response, NextFunction} from 'express';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(new Date().toLocaleString('fi-EN'), req.method, req.url);
  if (req.body) {
    console.log('body:', req.body);
  }
  next();
};

export default requestLogger;
