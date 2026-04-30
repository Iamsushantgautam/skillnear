import Withdrawal from '../models/Withdrawal.js';
import Booking from '../models/Booking.js';

// @desc    Create a withdrawal request
// @route   POST /api/withdrawals
// @access  Private/Provider
export const createWithdrawalRequest = async (req, res) => {
    try {
        const { amount, method = 'Bank Transfer', details = 'Not provided' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please enter a valid amount' });
        }

        const providerId = req.user._id;

        // 1. Calculate total earnings (sum of paid online bookings)
        const bookings = await Booking.find({ 
            provider: providerId, 
            paymentStatus: 'paid',
            paymentMode: { $ne: 'Cash' },
            paymentMethod: { $ne: 'cash_on_delivery' }
        });
        const totalEarnings = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

        // 2. Calculate already withdrawn/pending amounts
        const withdrawals = await Withdrawal.find({ user: providerId, status: { $in: ['pending', 'successful'] } });
        const withdrawnOrPending = withdrawals.reduce((acc, w) => acc + w.amount, 0);

        const availableBalance = totalEarnings - withdrawnOrPending;

        if (amount > availableBalance) {
            return res.status(400).json({ message: `Insufficient balance. Available: ₹${availableBalance}` });
        }

        const withdrawal = await Withdrawal.create({
            user: providerId,
            amount,
            method,
            details,
            status: 'pending'
        });

        if (withdrawal) {
            res.status(201).json(withdrawal);
        } else {
            res.status(400).json({ message: 'Invalid withdrawal data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my withdrawal requests
// @route   GET /api/withdrawals/my
// @access  Private/Provider
export const getMyWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
