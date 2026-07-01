import express from 'express';
import { getRegister, postRegister, getLogin, postLogin, logout } from '../controllers/auth.controller.js';
import { isGuest } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { registerValidation, loginValidation } from '../dtos/auth.dto.js';

const router = express.Router();

router.get('/register', isGuest, getRegister);
router.post('/register', isGuest, registerValidation, validateRequest, postRegister);

router.get('/login', isGuest, getLogin);
router.post('/login', isGuest, loginValidation, validateRequest, postLogin);

router.post('/logout', logout);

export default router;
