import express from 'express';
import {
    getUsers,
    getUserById,
    updateUserProfile,
    updateProviderStatus,
    updateUser,
    deleteUser,
    getShops,
    getPublicProfileByUsername
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getUsers);

router.route('/profile')
    .put(protect, updateUserProfile);

router.route('/shops')
    .get(getShops);

router.route('/public/:username')
    .get(getPublicProfileByUsername);

router.route('/:id')
    .get(getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

router.route('/:id/provider-status')
    .put(protect, admin, updateProviderStatus);

export default router;
