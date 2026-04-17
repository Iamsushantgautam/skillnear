import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        provider: { // Useful for overall rating of the professional
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        service: { // Can be null if reviewing a freelance project
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
