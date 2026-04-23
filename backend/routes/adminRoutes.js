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
    getUserFullDetails,
    getGlobalMedia,
    deleteMedia,
    createNewUser,
    getWithdrawals,
    updateWithdrawalStatus
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Media Gallery routes
router.get('/media', protect, admin, getGlobalMedia);
router.delete('/media', protect, admin, deleteMedia);
router.post('/users', protect, admin, createNewUser);
router.get('/withdrawals', protect, admin, getWithdrawals);
router.put('/withdrawals/:id', protect, admin, updateWithdrawalStatus);

// User management details - Put this at the top
router.get('/users/:userId/full-details', protect, admin, getUserFullDetails);

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
