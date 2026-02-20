import Message from '../models/Message.js';
import Booking from '../models/Booking.js';

// Helper to validate room access and get room info
const validateRoom = async (roomId, userId) => {
    let type = null;
    let title = '';
    let otherUser = null;

    // Check if it's a booking
    let booking = null;
    try { booking = await Booking.findById(roomId).populate('user', 'name avatar').populate('provider', 'name avatar'); } catch (e) { }

    if (booking) {
        if (booking.user._id.toString() !== userId && booking.provider._id.toString() !== userId) return null; // Unauthorized
        type = 'Booking';
        title = `Booking #${roomId.slice(-6)}`;
        otherUser = booking.user._id.toString() === userId ? booking.provider : booking.user;
        return { type, title, otherUser };
    }

    return null; // Not found
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

        // Find Bookings where user is client or provider
        const bookings = await Booking.find({
            $or: [{ user: myId }, { provider: myId }]
        }).populate('user', 'name avatar').populate('provider', 'name avatar');

        const rooms = [];

        for (const booking of bookings) {
            const otherUser = booking.user._id.toString() === myId ? booking.provider : booking.user;
            const latestMsg = await Message.findOne({ roomId: booking._id.toString() }).sort({ createdAt: -1 });

            rooms.push({
                roomId: booking._id.toString(),
                title: `Booking #${booking._id.toString().slice(-6)}`,
                type: 'Booking',
                otherUser,
                lastMessage: latestMsg ? latestMsg.message : 'No messages yet',
                updatedAt: latestMsg ? latestMsg.createdAt : booking.createdAt,
            });
        }

        rooms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
