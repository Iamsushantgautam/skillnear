import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    applyToBeProvider,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.post('/become-provider', protect, applyToBeProvider);

export default router;
