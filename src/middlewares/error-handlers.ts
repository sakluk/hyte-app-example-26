import {validationResult} from 'express-validator';
import type {Request, Response, NextFunction} from 'express';
import type {CustomError} from '../types/index.js';

/**
* Custom middleware for handling and formatting validation errors
* @param {object} req - request object
* @param {object} res - response object
* @param {function} next - next function
* @return {*} next function call
*/
const validationErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log('validation errors', errors.array({onlyFirstError: true}));
    const error: CustomError = new Error('Bad Request');
    error.status = 400;
    error.errors = errors.array({onlyFirstError: true}).map((err) => {
      const validationErr = err as {path: string; msg: string};
      return {field: validationErr.path, message: validationErr.msg};
    });
    return next(error);
  }
  next();
};

/**
 * Default middleware for 404 requests
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error); // forward error to error handler
};

/**
* Custom default middleware for handling errors
*/
// eslint-disable-next-line no-unused-vars
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500); // default is 500 if err.status is not defined
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
      errors: err.errors || ''
    }
  });
};


export {validationErrorHandler, notFoundHandler, errorHandler};
