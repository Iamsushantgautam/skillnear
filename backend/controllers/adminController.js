import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

// @desc    Get dashboard analytics (real data)
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const providers = await User.countDocuments({ role: 'provider' });
        const customers = await User.countDocuments({ role: 'customer' });
        const pendingProviders = await User.countDocuments({
            role: 'provider',
            'providerDetails.isApproved': { $ne: true }
        });

        const totalServices = await Service.countDocuments({ isApproved: true, isActive: true });
        const pendingServices = await Service.countDocuments({ isApproved: false });

        const totalBookings = await Booking.countDocuments();

        // Revenue: 10% commission on completed bookings
        const completedBookings = await Booking.find({ status: 'completed' });
        const totalRevenue = completedBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0) * 0.10;

        // Recent bookings (last 5) — note: Booking model uses 'user' not 'customer'
        const recentBookings = await Booking.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name avatar')
            .populate('service', 'title price');

        // Map 'user' => 'customer' for the frontend
        const mappedBookings = recentBookings.map(b => ({
            _id: b._id,
            customer: b.user,
            service: b.service,
            totalPrice: b.totalPrice,
            status: b.status,
            createdAt: b.createdAt,
        }));

        res.json({
            users: { totalUsers, providers, customers, pendingProviders },
            services: { totalServices, pendingServices },
            bookings: { totalBookings, recentBookings: mappedBookings },
            revenue: totalRevenue,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ALL services (for admin — includes unapproved)
// @route   GET /api/admin/services
// @access  Private/Admin
export const getAdminServices = async (req, res) => {
    try {
        const { status } = req.query; // 'pending' | 'approved' | 'all'
        let filter = {};
        if (status === 'pending') filter = { isApproved: false };
        else if (status === 'approved') filter = { isApproved: true };
        // status=all or undefined → no filter → return everything

        const services = await Service.find(filter)
            .populate('provider', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(services);
    } catch (error) {
        console.error('getAdminServices error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a service gig
// @route   PUT /api/admin/services/:id/approve
// @access  Private/Admin
export const approveService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        service.isApproved = true;
        service.isActive = true;
        await service.save();

        res.json({ message: 'Service approved successfully', service });
    } catch (error) {
        console.error('approveService error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject / Unapprove a service gig
// @route   PUT /api/admin/services/:id/reject
// @access  Private/Admin
export const rejectService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        service.isApproved = false;
        service.isActive = false;
        await service.save();

        res.json({ message: 'Service rejected successfully', service });
    } catch (error) {
        console.error('rejectService error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service (admin)
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
export const deleteAdminService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        await service.deleteOne();
        res.json({ message: 'Service deleted' });
    } catch (error) {
        console.error('deleteAdminService error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ALL users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('getAllUsers error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = role;
        // If changing from provider to customer, might want to disable provider approval
        if (role === 'customer') {
            if (user.providerDetails) {
                user.providerDetails.isApproved = false;
            }
        }
        
        await user.save();
        res.json({ message: `Role updated to ${role}`, user });
    } catch (error) {
        console.error('updateUserRole error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:userId/ban
// @access  Private/Admin
export const toggleUserBan = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', user });
    } catch (error) {
        console.error('toggleUserBan error:', error);
        res.status(500).json({ message: error.message });
    }
};
