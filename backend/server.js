import express from 'express';
// Force reload 3
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';
import Notification from './models/Notification.js';
import sendEmail from './utils/sendEmail.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// CORS allowed origins: localhost + production Vercel domains from environment
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://skillnear.sushant.online',
    'https://skillnear-admin.sushant.online',
    'https://extrospective-hemihedrally-cathryn.ngrok-free.dev',
    process.env.FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, mobile apps)
        if (!origin || allowedOrigins.includes(origin) || origin.includes('ngrok')) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin '${origin}' is not allowed`));
        }
    },
    credentials: true,
};

// Initialize Socket.io (must be after corsOptions is defined)
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('ngrok'))) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true
    }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io connection handling
const activeUsers = new Set();

io.on('connection', (socket) => {
    socket.on('setup', (userId) => {
        socket.join(userId);
        activeUsers.add(userId);
        io.emit('onlineUsers', Array.from(activeUsers));
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    socket.on('typing', (data) => {
        socket.to(data.roomId).emit('typing', { userId: data.userId });
    });

    socket.on('stopTyping', (data) => {
        socket.to(data.roomId).emit('stopTyping', { userId: data.userId });
    });

    socket.on('readMessages', async (data) => {
        const { roomId, userId } = data;
        // Update DB
        await Message.updateMany(
            { roomId, receiverId: userId, read: false },
            { $set: { read: true } }
        );
        // Emit to the other user in the room
        socket.to(roomId).emit('messagesRead', { roomId, userId });
    });

    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, roomId, message, messageType, fileUrl } = data;

        try {
            // Save to database first
            const newMessage = await Message.create({
                senderId,
                receiverId,
                roomId,
                message,
                messageType: messageType || 'text',
                fileUrl
            });

            // Emit to the specific room
            const messageToEmit = { ...newMessage._doc, tempId: data.tempId };
            io.to(roomId).emit('receiveMessage', messageToEmit);
            // Also emit to the receiver personally
            io.to(receiverId).emit('receiveMessage', messageToEmit);

            // Create notification for the receiver
            const notification = await Notification.create({
                recipient: receiverId,
                sender: senderId,
                type: 'new_message',
                title: 'New Message',
                message: messageType === 'text' ? (message.length > 50 ? message.substring(0, 50) + '...' : message) : `Sent an ${messageType}`,
                link: `/dashboard?tab=chat&room=${roomId}`
            });

            io.to(receiverId).emit('newNotification', notification);

            // Fetch the receiver to check if they are offline and a provider
            if (!activeUsers.has(receiverId)) {
                const receiver = await User.findById(receiverId);
                const sender = await User.findById(senderId);

                if (receiver && sender) { // Check both to be safe
                    // If receiver is a provider and they are offline
                    if (receiver.role === 'provider') {
                        const emailHtml = `
                            <h2>You have a new message on SkillNear</h2>
                            <p><strong>${sender.name}</strong> has sent you a message:</p>
                            <p style="padding: 12px; background: #f3f4f6; border-radius: 8px;">"${message}"</p>
                            <a href="${process.env.FRONTEND_URL}/chat" style="display:inline-block; padding:10px 20px; background:#0284c7; color:#fff; text-decoration:none; border-radius:5px;">Reply Now</a>
                        `;
                        await sendEmail({
                            to: receiver.email,
                            subject: 'New Message from Client - SkillNear',
                            htmlContent: emailHtml,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error saving message via socket', error);
        }
    });

    socket.on('typing', (roomId) => socket.in(roomId).emit('typing'));
    socket.on('stopTyping', (roomId) => socket.in(roomId).emit('stopTyping'));

    socket.on('markAsRead', async ({ messageId, roomId }) => {
        try {
            await Message.findByIdAndUpdate(messageId, { read: true });
            io.to(roomId).emit('messageRead', messageId);
        } catch (e) { }
    });

    socket.on('disconnect_user', (userId) => {
        activeUsers.delete(userId);
        io.emit('onlineUsers', Array.from(activeUsers));
    });

    socket.on('disconnect', () => {
        // Handled basically by disconnect_user normally
    });
});

// Routes definition
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'SkillNear API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
