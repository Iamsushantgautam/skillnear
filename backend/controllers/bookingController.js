import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Message from '../models/Message.js';

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

        // Create initial system message in the chat
        await Message.create({
            senderId: req.user._id,
            receiverId: service.provider,
            roomId: createdBooking._id.toString(),
            message: `BOOKING: New booking request for ${service.title} on ${date} at ${timeSlot}.`
        });

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
    console.log(`ATTEMPTING STATUS UPDATE: ${req.params.id} -> ${req.body.status}`);
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            // Check authorization (either the customer or the provider can cancel in some cases, provider updates progress)
            const isProvider = booking.provider.toString() === req.user._id.toString();
            const isCustomer = booking.user.toString() === req.user._id.toString();
            
            let authorized = false;

            if (req.user.role === 'admin') {
                authorized = true;
            } else if (isProvider) {
                if (['confirmed', 'in_progress', 'delivered', 'cancelled'].includes(status)) {
                    authorized = true;
                }
            } else if (isCustomer) {
                if (['completed', 'revision_requested', 'cancelled'].includes(status)) {
                    authorized = true;
                }
            }

            if (authorized) {
                // EXTREME BYPASS: Use the raw MongoDB collection to update status without ANY Mongoose schema involvement
                await Booking.collection.updateOne(
                    { _id: booking._id },
                    { $set: { status: status } }
                );

                // Fetch the updated document via Mongoose for the response (no validation on find)
                const updatedBooking = await Booking.findById(req.params.id)
                    .populate('service', 'title category')
                    .populate('user', 'name avatar phone');

                if (status === 'revision_requested' && req.body.revisionNote) {
                    await Booking.collection.updateOne(
                        { _id: booking._id },
                        { $push: { revisions: { note: req.body.revisionNote, date: new Date() } } }
                    );
                }

                // Create system message about status change
                await Message.create({
                    senderId: req.user._id,
                    receiverId: isProvider ? updatedBooking.user : updatedBooking.provider,
                    roomId: updatedBooking._id.toString(),
                    message: `STATUS UPDATE: Booking status changed to ${status.replace('_', ' ').toUpperCase()}.${req.body.revisionNote ? ` Note: ${req.body.revisionNote}` : ''}`
                });

                res.json(updatedBooking);
            } else {
                res.status(401).json({ message: 'Not authorized to change to this status' });
            }
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('service', 'title category price')
            .populate('user', 'name email phone avatar')
            .populate('provider', 'name email phone avatar')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get provider dashboard stats
// @route   GET /api/bookings/provider/stats
// @access  Private/Provider
export const getProviderStats = async (req, res) => {
    try {
        const providerId = req.user._id;

        // 1. Gigs count
        const totalGigs = await Service.countDocuments({ provider: providerId });
        const activeGigs = await Service.countDocuments({ provider: providerId, isActive: true, isApproved: true });

        // 2. Bookings count
        const bookings = await Booking.find({ provider: providerId });
        const totalOrders = bookings.length;
        const pendingOrders = bookings.filter(b => b.status === 'pending').length;

        // 3. Earnings (Sum of completed bookings)
        const totalEarnings = bookings
            .filter(b => b.status === 'completed')
            .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

        // 4. Chart Data (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthEarnings = bookings
                .filter(b => b.status === 'completed' && b.createdAt >= monthStart && b.createdAt <= monthEnd)
                .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

            chartData.push({ name: monthName, earnings: monthEarnings });
        }

        res.json({
            activeGigs,
            totalGigs,
            totalOrders,
            totalEarnings,
            pendingOrders,
            chartData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
