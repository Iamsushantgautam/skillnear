import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Withdrawal from '../models/Withdrawal.js';
import Review from '../models/Review.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Get all media from Cloudinary folder
// @route   GET /api/admin/media
// @access  Private/Admin
export const getGlobalMedia = async (req, res) => {
    try {
        // Configure cloudinary (assuming it might not be global yet)
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Strategy 1: Resources API with prefix (most reliable for all plans)
        console.log("Attempting Strategy 1: Resources API with 'skillnear/' prefix...");
        let result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'skillnear/', 
            max_results: 500
        });

        // Strategy 2: If Strategy 1 failed, try without the trailing slash
        if (!result.resources || result.resources.length === 0) {
            console.log("Strategy 1 returned 0, attempting Strategy 2: Prefix 'skillnear' (no slash)...");
            result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'skillnear',
                max_results: 500
            });
        }

        // Strategy 3: Search API (if enabled)
        if (!result.resources || result.resources.length === 0) {
            try {
                console.log("Strategy 2 returned 0, attempting Strategy 3: Search API 'folder:skillnear'...");
                const searchRes = await cloudinary.search
                    .expression('folder:skillnear')
                    .max_results(500)
                    .execute();
                if (searchRes.resources && searchRes.resources.length > 0) {
                    result = searchRes;
                }
            } catch (searchErr) {
                console.log("Search API Strategy failed or not available:", searchErr.message);
            }
        }

        // Strategy 4: Final Fallback - Root assets
        const isFallback = !result.resources || result.resources.length === 0;
        if (isFallback) {
            console.log("All folder strategies failed. Fetching root assets as final fallback...");
            result = await cloudinary.api.resources({
                type: 'upload',
                max_results: 100
            });
        }

        res.json({
            success: true,
            resources: result.resources || [],
            isFallback
        });
    } catch (error) {
        console.error("Cloudinary fetch error:", error);
        res.status(500).json({ message: "Failed to fetch cloud media", error: error.message });
    }
};

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

// @desc    Create new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createNewUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all withdrawals
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({}).populate('user', 'name email avatar').sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update withdrawal status
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
export const updateWithdrawalStatus = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (withdrawal) {
            withdrawal.status = req.body.status || withdrawal.status;
            if (req.body.status === 'successful') {
                withdrawal.processedAt = new Date();
            }
            const updated = await withdrawal.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Withdrawal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a withdrawal request
// @route   DELETE /api/admin/withdrawals/:id
// @access  Private/Admin
export const deleteWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }
        await withdrawal.deleteOne();
        res.json({ message: 'Withdrawal request deleted successfully' });
    } catch (error) {
        console.error('deleteWithdrawal error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user full details including gigs, reviews, and bookings
// @route   GET /api/admin/users/:userId/full-details
// @access  Private/Admin
export const getUserFullDetails = async (req, res) => {
    try {
        const userId = req.params.userId || req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch gigs (services) where this user is the provider
        const gigs = await Service.find({ provider: user._id }).sort({ createdAt: -1 });

        // Fetch bookings where this user is the customer OR the provider
        const bookings = await Booking.find({
            $or: [{ user: user._id }, { provider: user._id }]
        })
        .populate('service', 'title images price')
        .populate('user', 'name email avatar')
        .populate('provider', 'name email avatar')
        .sort({ createdAt: -1 });

        // Fetch reviews where this user is the provider OR the user who wrote it
        const reviews = await Review.find({
            $or: [{ provider: user._id }, { user: user._id }]
        })
        .populate('user', 'name avatar')
        .populate('provider', 'name avatar')
        .populate('service', 'title')
        .sort({ createdAt: -1 });

        // Fetch withdrawals for this user
        const withdrawals = await Withdrawal.find({ user: user._id }).sort({ createdAt: -1 });

        res.json({
            user,
            gigs,
            bookings,
            reviews,
            withdrawals
        });
    } catch (error) {
        console.error('getUserFullDetails error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete media from Cloudinary
// @route   DELETE /api/admin/media/:publicId
// @access  Private/Admin
export const deleteMedia = async (req, res) => {
    try {
        const { publicId } = req.query;
        
        if (!publicId) {
            return res.status(400).json({ message: "Public ID is required" });
        }
        
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.json({ success: true, message: "Media deleted successfully" });
        } else {
            res.status(400).json({ success: false, message: "Failed to delete media", result });
        }
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        res.status(500).json({ message: "Failed to delete media", error: error.message });
    }
};

