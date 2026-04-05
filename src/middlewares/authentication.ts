import jwt from 'jsonwebtoken';
import type {Response, NextFunction} from 'express';
import type {AuthenticatedRequest} from '../types/index.js';
import 'dotenv/config';

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  //console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  //console.log('token', token);
  if (token == undefined) {
    return res.sendStatus(401);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedRequest['user'];
    next();
  } catch (error) {
    console.log('token verification failed', error);
    res.status(403).send({message: 'invalid token'});
  }
};

export {authenticateToken};
