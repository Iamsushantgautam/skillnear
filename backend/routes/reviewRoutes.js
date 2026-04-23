import express from 'express';
import {
    addReview,
    updateReview,
    deleteReview,
    getServiceReviews,
    checkEligibility,
    getMyReviews,
    getProviderReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addReview);

router.get('/me', protect, getMyReviews);
router.get('/provider', protect, getProviderReviews);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

router.get('/service/:serviceId', getServiceReviews);
router.get('/check-eligibility/:serviceId', protect, checkEligibility);

export default router;
