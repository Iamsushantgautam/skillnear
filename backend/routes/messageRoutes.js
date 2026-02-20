import express from 'express';
import { getMessages, sendMessage, getRooms } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/rooms')
    .get(protect, getRooms);

router.route('/')
    .post(protect, sendMessage);

router.route('/:roomId')
    .get(protect, getMessages);

export default router;
