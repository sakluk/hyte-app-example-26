import jwt from 'jsonwebtoken';
import type {Request, Response, NextFunction} from 'express';
import 'dotenv/config';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  //console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  //console.log('token', token);
  if (token == undefined) {
    return res.sendStatus(401);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as Express.Request['user'];
    next();
  } catch (error) {
    console.log('token verification failed', error);
    res.status(403).send({message: 'invalid token'});
  }
};

export {authenticateToken};
