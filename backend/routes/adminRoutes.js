import express from 'express';
import {
    getAnalytics,
    getAdminServices,
    approveService,
    rejectService,
    deleteAdminService,
    getAllUsers,
    updateUserRole,
    toggleUserBan,
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

// User management
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:userId/role', protect, admin, updateUserRole);
router.put('/users/:userId/ban', protect, admin, toggleUserBan);

export default router;
