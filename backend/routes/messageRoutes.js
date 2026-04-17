import express from 'express';
import { getMessages, sendMessage, getRooms, deleteRoom, markMessagesAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/rooms')
    .get(protect, getRooms);

router.route('/')
    .post(protect, sendMessage);

router.route('/:roomId')
    .get(protect, getMessages)
    .delete(protect, deleteRoom);

router.route('/:roomId/read')
    .put(protect, markMessagesAsRead);

export default router;
