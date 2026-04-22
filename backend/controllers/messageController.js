import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Helper to validate room access and get room info
const validateRoom = async (roomId, userId) => {
    console.log(`[DEBUG] Validating room: ${roomId} for user: ${userId}`);
    let type = null;
    let title = '';
    let otherUser = null;

    // 1. Check if it's a booking-based room
    if (mongoose.Types.ObjectId.isValid(roomId)) {
        let booking = null;
        try {
            booking = await Booking.findById(roomId)
                .populate('user', 'name avatar')
                .populate('provider', 'name avatar');
        } catch (e) { }

        if (booking) {
            if (booking.user._id.toString() !== userId && booking.provider._id.toString() !== userId) return null;
            type = 'Booking';
            title = `Booking #${roomId.slice(-6).toUpperCase()}`;
            otherUser = booking.user._id.toString() === userId ? booking.provider : booking.user;
            return { type, title, otherUser };
        }
    }

    // 2. Check if it's a direct room (format: direct_id1_id2)
    if (typeof roomId === 'string' && roomId.startsWith('direct_')) {
        const parts = roomId.split('_');
        if (parts.length === 3) {
            const id1 = parts[1];
            const id2 = parts[2];

            if (id1 !== userId && id2 !== userId) return null; // User not in this room

            const otherUserId = id1 === userId ? id2 : id1;
            try {
                otherUser = await User.findById(otherUserId).select('name avatar');
                if (otherUser) {
                    type = 'Direct';
                    title = 'General Inquiry';
                    return { type, title, otherUser };
                }
            } catch (e) { }
        }
    }

    return null; // Not found or invalid
};

// @desc    Get chat history for a room
// @route   GET /api/messages/:roomId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const myId = req.user._id.toString();

        const roomValid = await validateRoom(roomId, myId);
        if (!roomValid) {
            return res.status(403).json({ message: 'Not authorized or room does not exist' });
        }

        const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message via HTTP
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { roomId, message, receiverId } = req.body;
        const senderId = req.user._id;

        const roomValid = await validateRoom(roomId, senderId.toString());
        if (!roomValid) {
            return res.status(403).json({ message: 'Not authorized to send message in this room' });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            roomId,
            message,
        });

        const createdMessage = await newMessage.save();
        res.status(201).json(createdMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active chat rooms for a user
// @route   GET /api/messages/rooms
// @access  Private
export const getRooms = async (req, res) => {
    try {
        const myId = req.user._id.toString();

        // 1. Find Bookings (Booking Rooms)
        const bookings = await Booking.find({
            $or: [{ user: myId }, { provider: myId }]
        }).populate('user', 'name avatar').populate('provider', 'name avatar');

        const roomsMap = new Map();

        for (const booking of bookings) {
            if (!booking.user || !booking.provider) continue;

            const bookingUserId = booking.user?._id ? booking.user._id.toString() : booking.user.toString();
            const otherUser = bookingUserId === myId ? booking.provider : booking.user;
            
            const latestMsg = await Message.findOne({ roomId: booking._id.toString() }).sort({ createdAt: -1 });
            const unreadCount = await Message.countDocuments({ roomId: booking._id.toString(), receiverId: myId, read: false });

            roomsMap.set(booking._id.toString(), {
                roomId: booking._id.toString(),
                title: `Booking #${booking._id.toString().slice(-6).toUpperCase()}`,
                type: 'Booking',
                otherUser,
                lastMessage: latestMsg ? latestMsg.message : 'No messages yet',
                updatedAt: latestMsg ? latestMsg.createdAt : booking.createdAt,
                unreadCount
            });
        }

        // 2. Find Direct Rooms from Message history (where not linked to a booking)
        const directMessages = await Message.find({
            $or: [{ senderId: myId }, { receiverId: myId }]
        }).sort({ createdAt: -1 });

        for (const msg of directMessages) {
            if (!roomsMap.has(msg.roomId)) {
                // If it's a direct room (verified by ID format in Chat.jsx)
                if (msg.roomId.startsWith('direct_')) {
                    const parts = msg.roomId.split('_');
                    const otherUserId = parts[1] === myId ? parts[2] : parts[1];
                    const otherUser = await User.findById(otherUserId).select('name avatar');
                    const unreadCount = await Message.countDocuments({ roomId: msg.roomId, receiverId: myId, read: false });

                    roomsMap.set(msg.roomId, {
                        roomId: msg.roomId,
                        title: 'General Chat',
                        type: 'Direct',
                        otherUser,
                        lastMessage: msg.message,
                        updatedAt: msg.createdAt,
                        unreadCount
                    });
                }
            } else {
                // If room exists, check if this message is newer
                const existing = roomsMap.get(msg.roomId);
                if (new Date(msg.createdAt) > new Date(existing.updatedAt)) {
                    existing.lastMessage = msg.message;
                    existing.updatedAt = msg.createdAt;
                }
            }
        }

        const rooms = Array.from(roomsMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all messages in a room
// @route   DELETE /api/messages/:roomId
// @access  Private
export const markMessagesAsRead = async (req, res) => {
    try {
        const { roomId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { roomId, receiverId: myId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const myId = req.user._id;
        const myIdStr = myId.toString();

        // 1. Try formal validation (checks Booking or Direct room logic)
        const roomValid = await validateRoom(roomId, myIdStr);
        
        if (!roomValid) {
            console.log(`[DEBUG] Formal validation failed for room ${roomId}. Checking message participants fallback...`);
            
            // 2. Fallback: If room validation fails (e.g. booking was deleted), 
            // allow deletion if the user is either the sender or receiver of ANY message in this roomId.
            const messageExists = await Message.findOne({
                roomId,
                $or: [{ senderId: myId }, { receiverId: myId }]
            });

            if (!messageExists) {
                console.log(`[DEBUG] Fallback failed. User ${myIdStr} is not part of any messages in room ${roomId}.`);
                return res.status(403).json({ message: 'Not authorized or room does not exist' });
            }
            console.log(`[DEBUG] Fallback success. User found in message history for room ${roomId}.`);
        }

        // Proceed with deletion
        const result = await Message.deleteMany({ roomId });
        console.log(`[DEBUG] Deleted ${result.deletedCount} messages from room ${roomId}`);
        
        res.json({ message: 'Chat history deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error(`[ERROR] Delete room failed: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
