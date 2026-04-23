import express from 'express';
import {
    getUsers,
    getUserById,
    updateUserProfile,
    updateProviderStatus,
    updateUser,
    deleteUser,
    getShops,
    getPublicProfileByUsername,
    updateLocation,
    toggleFavorite,
    getFavorites
} from '../controllers/userController.js';
import { getUserFullDetails } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/location')
    .put(protect, updateLocation);

router.route('/favorites')
    .get(protect, getFavorites);

router.route('/favorites/:serviceId')
    .post(protect, toggleFavorite);

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
