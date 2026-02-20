import User from '../models/User.js';
import Service from '../models/Service.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        // Use aggregate to safely populate services in one query
        const usersList = await User.aggregate([
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'provider',
                    as: 'services',
                },
            },
            {
                $addFields: {
                    gigCount: { $size: '$services' },
                },
            },
            {
                $project: { password: 0, otp: 0, otpExpiry: 0 },
            },
        ]);

        res.json(usersList);
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            // Update avatar if provided
            if (req.body.avatar) {
                user.avatar = req.body.avatar;
            }

            if (req.body.address) {
                user.address = { ...user.address, ...req.body.address };
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                token: req.headers.authorization?.split(' ')[1], // return same token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Block service provider (Admin only)
// @route   PUT /api/users/:id/provider-status
// @access  Private/Admin
export const updateProviderStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'provider') {
                user.providerDetails.isApproved = isApproved;
                const updatedUser = await user.save();
                res.json(updatedUser);
            } else {
                res.status(400).json({ message: 'User is not a provider' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Delete all services/gigs attached to this user
            await Service.deleteMany({ provider: user._id });

            // Delete the user
            await user.deleteOne();
            res.json({ message: 'User removed, their gigs were also deleted.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user specific details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
