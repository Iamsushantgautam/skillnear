import Review from '../models/Review.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

// Helper to update service rating
const updateServiceRating = async (serviceId) => {
    const reviews = await Review.find({ service: serviceId });
    const numReviews = reviews.length;
    const rating = numReviews === 0 
        ? 0 
        : reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Service.findByIdAndUpdate(serviceId, {
        rating,
        numReviews,
    });
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { serviceId, rating, comment } = req.body;

        // 1. Check if user has already reviewed this service
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            service: serviceId,
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Service already reviewed' });
        }

        // 2. Check if user has a COMPLETED booking for this service
        const completedBooking = await Booking.findOne({
            user: req.user._id,
            service: serviceId,
            status: 'completed',
        });

        if (!completedBooking) {
            return res.status(403).json({ message: 'You can only review services you have purchased and that are marked as completed' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const review = new Review({
            user: req.user._id,
            provider: service.provider,
            service: serviceId,
            rating: Number(rating),
            comment,
        });

        await review.save();
        await updateServiceRating(serviceId);

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (review) {
            if (review.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to edit this review' });
            }

            review.rating = Number(rating) || review.rating;
            review.comment = comment || review.comment;

            const updatedReview = await review.save();
            await updateServiceRating(review.service);

            res.json(updatedReview);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (review) {
            if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to delete this review' });
            }

            const serviceId = review.service;
            await review.deleteOne();
            await updateServiceRating(serviceId);

            res.json({ message: 'Review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ service: req.params.serviceId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if user is eligible to review a service
// @route   GET /api/reviews/check-eligibility/:serviceId
// @access  Private
export const checkEligibility = async (req, res) => {
    try {
        const completedBooking = await Booking.findOne({
            user: req.user._id,
            service: req.params.serviceId,
            status: 'completed',
        });

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            service: req.params.serviceId,
        });

        res.json({
            isEligible: !!completedBooking,
            alreadyReviewed: !!alreadyReviewed,
            reviewId: alreadyReviewed ? alreadyReviewed._id : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews written by the logged-in user
// @route   GET /api/reviews/me
// @access  Private
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('service', 'title images')
            .populate('provider', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews received by the logged-in provider
// @route   GET /api/reviews/provider
// @access  Private
export const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.user._id })
            .populate('user', 'name avatar')
            .populate('service', 'title')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
