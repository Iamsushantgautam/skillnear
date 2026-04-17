import User from '../models/User.js';
import Service from '../models/Service.js';

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
export const updateLocation = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            const { lat, lng, pincode, city, state } = req.body;
            
            if (lat && lng) {
                user.geoCoordinates = {
                    type: 'Point',
                    coordinates: [Number(lng), Number(lat)]
                };
            }
            
            user.address = {
                ...user.address,
                pincode: pincode || user.address?.pincode,
                city: city || user.address?.city,
                state: state || user.address?.state
            };

            await user.save();
            res.json({ message: 'Location updated successfully', location: user.address, geoCoordinates: user.geoCoordinates });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
            
            // Only update username if it's provided and different (ignore empty strings)
            if (req.body.username && req.body.username.trim() !== "" && req.body.username !== user.username) {
                const usernameExists = await User.findOne({ username: req.body.username });
                if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'Username is already taken' });
                }
                user.username = req.body.username;
            }
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

            if (user.role === 'provider' && req.body.providerDetails) {
                user.providerDetails = {
                    ...user.providerDetails,
                    ...req.body.providerDetails
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                username: updatedUser.username,
                role: updatedUser.role,
                providerDetails: updatedUser.providerDetails,
                token: req.headers.authorization?.split(' ')[1], // return same token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Username is already taken' });
        } else {
            res.status(500).json({ message: error.message });
        }
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

// @desc    Get all active shops
// @route   GET /api/users/shops
// @access  Public
export const getShops = async (req, res) => {
    try {
        const shops = await User.find({
            role: 'provider',
            'providerDetails.providerType': 'Shop',
            'providerDetails.isApproved': true
        }).select('-password -otp -otpExpiry');
        
        res.json(shops);
    } catch (error) {
        console.error('getShops error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getPublicProfileByUsername = async (req, res) => {
    try {
        const usernameQuery = req.params.username;
        // Case-insensitive search
        const user = await User.findOne({ 
            username: { $regex: new RegExp(`^${usernameQuery}$`, 'i') } 
        }).select('-password -otp -otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const services = await Service.find({ provider: user._id, isApproved: true });

        res.json({
            user,
            services
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
