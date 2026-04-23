import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        roomId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: false, // Optional if it's a file
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'voice'],
            default: 'text',
        },
        fileUrl: {
            type: String,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
