import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { serviceId, date, timeSlot, address, paymentMethod } = req.body;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const booking = new Booking({
            user: req.user._id,
            service: serviceId,
            provider: service.provider, // Provider ID from service
            date,
            timeSlot,
            address,
            totalPrice: service.price, // Assuming no extra fees for now
            paymentMethod,
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings (as a customer)
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('service', 'title category price img')
            .populate('provider', 'name avatar');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for logged in provider
// @route   GET /api/bookings/provider
// @access  Private/Provider
export const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id })
            .populate('service', 'title category')
            .populate('user', 'name avatar phone');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Check authorization (either the customer or the provider can cancel in some cases, provider updates progress)
            if (
                booking.provider.toString() === req.user._id.toString() ||
                (booking.user.toString() === req.user._id.toString() && status === 'cancelled') ||
                req.user.role === 'admin'
            ) {
                booking.status = status;
                const updatedBooking = await booking.save();
                res.json(updatedBooking);
            } else {
                res.status(401).json({ message: 'Not authorized to update this booking' });
            }
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
