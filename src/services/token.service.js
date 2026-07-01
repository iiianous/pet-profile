import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRE, COOKIE_SECURE, COOKIE_MAX_AGE } from '../config/index.js';

export const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

export const sendTokenResponse = (user, res, redirectPath = '/dashboard') => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  };

  res.cookie('token', token, cookieOptions);
  res.redirect(redirectPath);
};
