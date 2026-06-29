import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

const sendTokenResponse = (user, res, redirectPath = '/dashboard') => {
  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  };

  res.cookie('token', token, cookieOptions);
  res.redirect(redirectPath);
};

export const getRegister = (req, res) => {
  res.render('register', {
    title: 'Create account',
    errors: [],
    values: {}
  });
};

export const postRegister = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('register', {
        title: 'Create account',
        errors: errors.array(),
        values: req.body
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Create account',
        errors: [{ msg: 'An account with that email already exists.' }],
        values: req.body
      });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, res, '/dashboard');
  } catch (error) {
    next(error);
  }
};

export const getLogin = (req, res) => {
  res.render('login', {
    title: 'Sign in',
    errors: [],
    values: {}
  });
};

export const postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('login', {
        title: 'Sign in',
        errors: errors.array(),
        values: req.body
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).render('login', {
        title: 'Sign in',
        errors: [{ msg: 'Invalid email or password.' }],
        values: req.body
      });
    }

    sendTokenResponse(user, res, '/dashboard');
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
