import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, username } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        const user = await User.create({
            name,
            email,
            username,
            password,
            phone,
        });

        if (user) {
            const token = generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                username: user.username,
                phone: user.phone,
                role: user.role,
                providerDetails: user.providerDetails,
                favorites: user.favorites || [],
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const identifier = email.trim();
        const user = await User.findOne({ 
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                username: user.username,
                phone: user.phone,
                role: user.role,
                providerDetails: user.providerDetails,
                favorites: user.favorites || [],
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply to become a provider
// @route   POST /api/auth/become-provider
// @access  Private
export const applyToBeProvider = async (req, res) => {
    console.log("ApplyToBeProvider Request Body:", req.body);
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized, user information missing' });
        }
        const {
            about, experienceYears, providerType, title,
            shopName, ownerName, location, images,
            serviceName, serviceProviderName, liveLocation, shopDetails, shopAddress
        } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.role = 'provider';
            const exp = parseInt(experienceYears);
            user.providerDetails = {
                about: about || '',
                experienceYears: isNaN(exp) ? 0 : exp,
                isApproved: true,
                availability: true,
                providerType: providerType || 'Services',
                title: title || '',

                shopName, ownerName, location, images: images || [],

                serviceName, serviceProviderName, liveLocation, shopDetails, shopAddress
            };

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                providerDetails: updatedUser.providerDetails,
                favorites: updatedUser.favorites || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("ApplyToBeProvider Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();

        const emailHtml = `
            <h2>Password Reset Request</h2>
            <p>Your 6-digit OTP for password reset is:</p>
            <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; letter-spacing: 5px; color: #0284c7;">${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: 'Password Reset OTP - SkillNear',
            htmlContent: emailHtml,
        });

        res.json({ message: 'OTP sent to your email successfully.' });
    } catch (error) {
        console.error("ForgotPassword Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset completely successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
