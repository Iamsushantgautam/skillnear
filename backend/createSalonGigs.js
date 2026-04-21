import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';

dotenv.config();

const createSalonGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`User with email ${targetEmail} not found. Please register this user first.`);
            process.exit(1);
        }

        // Ensure user is a provider
        if (user.role !== 'provider') {
            user.role = 'provider';
            if (!user.providerDetails) {
                user.providerDetails = {
                    title: 'Professional Salon Expert',
                    about: 'Top-rated grooming and beauty services expert.',
                    isApproved: true
                };
            }
            await user.save();
            console.log(`Updated user ${targetEmail} to provider role.`);
        }

        const salonGigs = [
            {
                provider: user._id,
                title: 'Royal Mans Grooming Studio',
                category: 'Salon',
                businessType: 'service',
                targetGender: 'male',
                experience: 8,
                jobsCompleted: 1200,
                description: 'Premium hair styling, beard grooming, and facial treatments for the modern man. Experience luxury grooming at its best.',
                servicesIncluded: ['Haircut & Styling', 'Beard Trim', 'Head Massage', 'Deep Cleaning Facial'],
                price: 500,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' },
                geoCoordinates: { type: 'Point', coordinates: [80.9462, 26.8467] },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'The Gentlemens Barber Shop',
                category: 'Salon',
                businessType: 'shop',
                targetGender: 'male',
                experience: 12,
                jobsCompleted: 3500,
                description: 'Traditional barber shop offering premium products and classic cuts. We sell professional grooming kits and imported hair waxes.',
                servicesIncluded: ['Classic Haircuts', 'Shaving Kits', 'Hair Care Products', 'Home Service Available'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Hazratganj Main Road', zipCode: '226001' },
                geoCoordinates: { type: 'Point', coordinates: [80.9470, 26.8480] },
                shopDetails: {
                    shopName: 'Gents Hub',
                    shopAge: 12,
                    openingTime: '09:00 AM',
                    closingTime: '09:00 PM',
                    isHomeService: true,
                    homeServiceFee: 100
                },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'Glow Up Ladies Beauty Lounge',
                category: 'Salon',
                businessType: 'service',
                targetGender: 'female',
                experience: 10,
                jobsCompleted: 2000,
                description: 'Full-service ladies salon specializing in hair coloring, bridal makeup, and skin rejuvenation. Our experts use only premium organic products.',
                servicesIncluded: ['Bridal Makeup', 'Hair Spa & Botox', 'Hydra Facial', 'Waxing & Pedicure'],
                price: 1200,
                priceType: 'starting_at',
                images: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9992, 26.8467] },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'Luxe Beauty & Cosmetic Hub',
                category: 'Salon',
                businessType: 'shop',
                targetGender: 'female',
                experience: 5,
                jobsCompleted: 800,
                description: 'Your one-stop shop for premium international cosmetics and salon-grade hair tools. We host regular workshops for self-makeup.',
                servicesIncluded: ['Premium Cosmetics', 'Hair Styling Tools', 'Makeup Workshops', 'Skin Analysis'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Gomti Nagar Mall', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9980, 26.8470] },
                shopDetails: {
                    shopName: 'Luxe Hub',
                    shopAge: 5,
                    openingTime: '10:30 AM',
                    closingTime: '08:30 PM',
                    isHomeDelivery: true
                },
                isActive: true,
                isApproved: true
            }
        ];

        // Delete existing salon gigs for this specific user to avoid duplicates if re-running
        // await Service.deleteMany({ provider: user._id, category: 'Salon' });

        const created = await Service.insertMany(salonGigs);
        console.log(`Successfully added ${created.length} Salon profiles (2 Male, 2 Female) for ${targetEmail}`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating salon gigs:', error);
        process.exit(1);
    }
};

createSalonGigs();
