import express from 'express';
import {
    getAnalytics,
    getAdminServices,
    approveService,
    rejectService,
    deleteAdminService,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Analytics
router.get('/analytics', protect, admin, getAnalytics);

// Service management
router.get('/services', protect, admin, getAdminServices);
router.put('/services/:id/approve', protect, admin, approveService);
router.put('/services/:id/reject', protect, admin, rejectService);
router.delete('/services/:id', protect, admin, deleteAdminService);

export default router;
