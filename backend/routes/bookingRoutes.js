import express from 'express';
import {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus,
    getAllBookings,
    getProviderStats
} from '../controllers/bookingController.js';
import { protect, provider, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createBooking);

router.get('/mybookings', protect, getMyBookings);
router.get('/provider', protect, provider, getProviderBookings);
router.get('/provider/stats', protect, provider, getProviderStats);
router.get('/all', protect, admin, getAllBookings);

router.route('/:id/status')
    .put(protect, updateBookingStatus);

export default router;
