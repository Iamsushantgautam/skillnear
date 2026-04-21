import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Mongoose Models (Define here to avoid import issues in standalone script)
const userSchema = new mongoose.Schema({
    email: String,
    role: String
});
const User = mongoose.model('User', userSchema);

const serviceSchema = new mongoose.Schema({
    provider: mongoose.Schema.Types.ObjectId,
    title: String,
    category: String,
    businessType: String,
    experience: Number,
    jobsCompleted: Number,
    description: String,
    price: Number,
    priceType: String,
    images: [String],
    location: {
        city: String,
        state: String,
        address: String,
        zipCode: String
    },
    geoCoordinates: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }
});
const Service = mongoose.model('Service', serviceSchema);

const createGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`User with email ${targetEmail} not found!`);
            process.exit(1);
        }

        console.log(`Found user: ${user._id} (${user.role})`);

        // If user is not yet a provider, update them (optional but helpful)
        if (user.role !== 'provider' && user.role !== 'admin') {
            user.role = 'provider';
            await user.save();
            console.log('Updated user role to provider');
        }

        const carpenterGigs = [
            {
                provider: user._id,
                title: 'Premium Woodworking & Furniture Repair',
                category: 'Carpenters',
                businessType: 'service',
                experience: 8,
                jobsCompleted: 250,
                description: 'Expert furniture repair and custom woodwork for your home. We specialize in teak, sheesham, and mango wood, providing a mirror-like finish and structural integrity to your antique or modern furniture.',
                price: 499,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Aliganj Sector H',
                    zipCode: '226024'
                },
                geoCoordinates: { type: 'Point', coordinates: [80.9462, 26.8920] }
            },
            {
                provider: user._id,
                title: 'Full Kitchen Cabinet Installation',
                category: 'Carpenters',
                businessType: 'service',
                experience: 5,
                jobsCompleted: 120,
                description: 'Modern modular kitchen cabinet installation and repair. Precision fit and high-quality finish for all types of laminates and hardware. We ensure smooth operation of all drawers and hinges.',
                price: 1500,
                priceType: 'starting_at',
                images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=2070&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Gomti Nagar, Viraj Khand',
                    zipCode: '226010'
                },
                geoCoordinates: { type: 'Point', coordinates: [81.0013, 26.8407] }
            },
            {
                provider: user._id,
                title: 'Modern Door & Window Fitting',
                category: 'Carpenters',
                businessType: 'service',
                experience: 10,
                jobsCompleted: 400,
                description: 'Installation and repair of modern doors, windows, and frames. Includes professional lock fitting, hinge adjustment, and weather-proofing. Guaranteed durable and silent operation.',
                price: 799,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Hazratganj, Park Road',
                    zipCode: '226001'
                },
                geoCoordinates: { type: 'Point', coordinates: [80.9416, 26.8467] }
            }
        ];

        // Clear existing carpenter gigs for this user to avoid duplication (optional)
        // await Service.deleteMany({ provider: user._id, category: 'Carpenters' });

        const created = await Service.insertMany(carpenterGigs);
        console.log(`Successfully added ${created.length} carpenter gigs to ${targetEmail}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding gigs:', error);
        process.exit(1);
    }
};

createGigs();
