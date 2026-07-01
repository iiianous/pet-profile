import { validationResult } from 'express-validator';
import ApiError from '../errors/api-error.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed.', errors.array()));
  }
  next();
};
