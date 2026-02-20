import express from 'express';
import {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, provider } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createBooking);

router.get('/mybookings', protect, getMyBookings);
router.get('/provider', protect, provider, getProviderBookings);

router.route('/:id/status')
    .put(protect, updateBookingStatus);

export default router;
