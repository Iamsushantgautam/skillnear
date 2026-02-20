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

// Service management — list all services
router.get('/services', protect, admin, getAdminServices);

// Service management — actions on specific service
router.put('/services/:serviceId/approve', protect, admin, approveService);
router.put('/services/:serviceId/reject', protect, admin, rejectService);
router.delete('/services/:serviceId', protect, admin, deleteAdminService);

export default router;
