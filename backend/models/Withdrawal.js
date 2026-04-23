import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'successful', 'rejected'],
            default: 'pending',
        },
        method: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        processedAt: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
