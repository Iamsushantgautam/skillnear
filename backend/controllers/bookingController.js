import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { serviceId, date, timeSlot, address, paymentMethod, totalPrice, customerName, customerPhone } = req.body;

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const booking = new Booking({
            user: req.user._id,
            service: serviceId,
            provider: service.provider,
            date,
            timeSlot,
            address,
            customerName,
            customerPhone,
            totalPrice: totalPrice || service.price,
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

        // Create notification for provider
        const notification = await Notification.create({
            recipient: service.provider,
            sender: req.user._id,
            type: 'booking_request',
            title: 'New Booking Request',
            message: `You have a new booking request for ${service.title} on ${date} at ${timeSlot}.`,
            link: '/dashboard'
        });

        // Emit via socket
        if (req.io) {
            req.io.to(service.provider.toString()).emit('newNotification', notification);
        }

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
            .populate('service', 'title category price images')
            .populate('provider', 'name avatar')
            .sort({ createdAt: -1 });
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
            .populate('service', 'title category images')
            .populate('user', 'name avatar phone')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name avatar')
            .populate('provider', 'name avatar')
            .populate('service', 'title images');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Auth check
        if (booking.user._id.toString() !== req.user._id.toString() && 
            booking.provider._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(booking);
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
                const updateData = { status: status };
                if (req.body.paymentMode) {
                    updateData.paymentMode = req.body.paymentMode;
                }

                // EXTREME BYPASS: Use the raw MongoDB collection to update status without ANY Mongoose schema involvement
                await Booking.collection.updateOne(
                    { _id: booking._id },
                    { $set: updateData }
                );

                // Fetch the updated document via Mongoose for the response (no validation on find)
                const updatedBooking = await Booking.findById(booking._id)
                    .populate('user', 'name email phone')
                    .populate('provider', 'name email phone')
                    .populate('service', 'title price');

                console.log(`STATUS UPDATED SUCCESSFULLY TO: ${updatedBooking.status}`);

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

                // Create notification for the other party
                const recipientId = isProvider ? updatedBooking.user : updatedBooking.provider;
                const notificationType = status === 'confirmed' ? 'booking_accepted' : (status === 'cancelled' ? 'booking_rejected' : 'service_update');
                
                const notification = await Notification.create({
                    recipient: recipientId,
                    sender: req.user._id,
                    type: notificationType,
                    title: `Booking ${status.replace('_', ' ').toUpperCase()}`,
                    message: `Your booking for ${updatedBooking.service?.title || 'service'} has been ${status.replace('_', ' ')}.${req.body.revisionNote ? ` Note: ${req.body.revisionNote}` : ''}`,
                    link: '/dashboard'
                });

                // Emit via socket
                if (req.io) {
                    req.io.to(recipientId.toString()).emit('newNotification', notification);
                }
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
            .populate('service', 'title category price images')
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
// @desc    Delete booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            await Booking.deleteOne({ _id: req.params.id });
            res.json({ message: 'Booking removed' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking details (Admin only)
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBooking = async (req, res) => {
    try {
        const { date, timeSlot, totalPrice, status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.date = date || booking.date;
            booking.timeSlot = timeSlot || booking.timeSlot;
            booking.totalPrice = totalPrice || booking.totalPrice;
            booking.status = status || booking.status;

            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
