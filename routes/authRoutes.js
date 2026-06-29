import express from 'express';
import { body } from 'express-validator';
import { getRegister, postRegister, getLogin, postLogin, logout } from '../controllers/authController.js';
import { isGuest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/register', isGuest, getRegister);
router.post(
  '/register',
  isGuest,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
  ],
  postRegister
);

router.get('/login', isGuest, getLogin);
router.post(
  '/login',
  isGuest,
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  postLogin
);

router.post('/logout', logout);

export default router;
