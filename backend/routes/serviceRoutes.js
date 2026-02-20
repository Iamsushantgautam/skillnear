import express from 'express';
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getMyServices,
} from '../controllers/serviceController.js';
import { protect, provider } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all APPROVED services
router.route('/')
    .get(getServices)
    .post(protect, createService); // Any logged-in user with role=provider can submit (requires role check inside controller)

// Private: Get current provider's own gigs (all statuses)
router.get('/mine', protect, getMyServices);

router.route('/:id')
    .get(getServiceById)
    .put(protect, updateService)
    .delete(protect, deleteService);

export default router;
