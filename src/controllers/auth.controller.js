import { validationResult } from 'express-validator';
import { registerUser, loginUser } from '../services/auth.service.js';
import { sendTokenResponse } from '../services/token.service.js';

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
    const user = await registerUser({ name, email, password });
    sendTokenResponse(user, res, '/dashboard');
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).render('register', {
        title: 'Create account',
        errors: [{ msg: error.message }],
        values: req.body
      });
    }
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
    const user = await loginUser(email, password);
    sendTokenResponse(user, res, '/dashboard');
  } catch (error) {
    if (error.statusCode === 401) {
      return res.status(401).render('login', {
        title: 'Sign in',
        errors: [{ msg: error.message }],
        values: req.body
      });
    }
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
