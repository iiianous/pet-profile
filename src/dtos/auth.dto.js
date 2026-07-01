import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.')
];
