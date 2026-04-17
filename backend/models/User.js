import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['customer', 'provider', 'admin'],
            default: 'customer',
        },
        phone: {
            type: String,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        avatar: {
            type: String,
            default: 'https://via.placeholder.com/150',
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
        // Provider specific fields
        providerDetails: {
            isApproved: {
                type: Boolean,
                default: false,
            },
            providerType: {
                type: String,
                enum: ['Shop', 'Services'],
            },
            title: String,
            about: String,
            experienceYears: Number,
            availability: {
                type: Boolean,
                default: true,
            },
            // Shop details
            shopName: String,
            ownerName: String,
            location: String,
            images: [String],

            // Service details
            serviceName: String,
            serviceProviderName: String,
            liveLocation: String,
            shopDetails: String,
            shopAddress: String,
        }
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
