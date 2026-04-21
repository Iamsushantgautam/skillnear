import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Mongoose Models
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
    servicesIncluded: [String],
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

        const fullGigs = [
            {
                provider: user._id,
                title: 'Expert Electrician - Residential Solutions',
                category: 'Electricians',
                businessType: 'service',
                experience: 12,
                jobsCompleted: 850,
                description: 'Certified electrical expert with 12+ years in advanced residential wiring and smart home systems. We provide safe, durable, and energy-efficient solutions for modern homes. Available for emergency repairs and full-house diagnostics.',
                servicesIncluded: ['Complete House Wiring', 'MCB & Distribution Board Service', 'Smart Home Light Installation', 'AC Control Unit Repair'],
                price: 299,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Indira Nagar, Near Wave Mall',
                    zipCode: '226016'
                },
                geoCoordinates: { type: 'Point', coordinates: [80.9840, 26.8839] }
            },
            {
                provider: user._id,
                title: 'Master Plumber - Luxury Bathroom Fittings',
                category: 'Plumbers',
                businessType: 'service',
                experience: 15,
                jobsCompleted: 1200,
                description: 'Specialized plumbing services for premium residential projects. Expert in installing designer bath-ware, advanced leak detection using ultrasonic sensors, and full drainage system refurbishment. Guaranteed no-leak policy.',
                servicesIncluded: ['Designer Faucet Installation', 'Advanced Leak Detection', 'Underground Pipe Repair', 'Sewage Line Maintenance'],
                price: 399,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Jankipuram Extension',
                    zipCode: '226021'
                },
                geoCoordinates: { type: 'Point', coordinates: [80.9398, 26.9157] }
            },
            {
                provider: user._id,
                title: 'Luxe Grooming Salon - Home Executive Service',
                category: 'Salon',
                businessType: 'service',
                experience: 7,
                jobsCompleted: 320,
                description: 'Bring the luxury salon experience to your doorstep. Precision grooming for local executives. We use high-end organic products and professional sterilization for every service. Includes a relaxing herbal facial as a compliment.',
                servicesIncluded: ['Precision Hair Styling', 'Executive Beard Grooming', 'Charcoal Detox Facial', 'Stress Relief Head Massage'],
                price: 599,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'],
                location: {
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    address: 'Vikas Nagar, Sector 4',
                    zipCode: '226022'
                },
                geoCoordinates: { type: 'Point', coordinates: [80.9576, 26.8967] }
            }
        ];

        const created = await Service.insertMany(fullGigs);
        console.log(`Successfully added ${created.length} full-detail professional gigs to ${targetEmail}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding full gigs:', error);
        process.exit(1);
    }
};

createGigs();
