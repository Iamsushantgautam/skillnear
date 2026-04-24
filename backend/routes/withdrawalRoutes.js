import express from 'express';
import { createWithdrawalRequest, getMyWithdrawals } from '../controllers/withdrawalController.js';
import { protect, provider } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, provider, createWithdrawalRequest);

router.get('/my', protect, provider, getMyWithdrawals);

export default router;
