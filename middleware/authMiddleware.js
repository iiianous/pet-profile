import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.redirect('/login');
    }

    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

export const isGuest = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.token) {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user) {
        return res.redirect('/dashboard');
      }
    }

    next();
  } catch (error) {
    res.clearCookie('token');
    next();
  }
};
