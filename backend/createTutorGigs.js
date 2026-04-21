import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';

dotenv.config();

const createTutorGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`User with email ${targetEmail} not found. Please register this user first.`);
            process.exit(1);
        }

        const tutorGigs = [
            {
                provider: user._id,
                title: 'Math & Science Excellence Prep',
                category: 'Tutors',
                businessType: 'service',
                targetGender: 'unisex',
                experience: 12,
                jobsCompleted: 450,
                description: 'Expert coaching for IIT-JEE and NEET foundation. We focus on conceptual clarity and problem-solving techniques for high school students.',
                servicesIncluded: ['Physics Coaching', 'Advanced Mathematics', 'Chemistry Lab Sessions', 'Weekly Mock Tests'],
                price: 1500,
                priceType: 'starting_at',
                plans: [
                    { name: 'Basic', price: 1500, description: '1 Week Trial (3 classes)', features: ['Concept Overview', 'Doubt Solving'], deliveryTime: '7 Days' },
                    { name: 'Standard', price: 5000, description: 'Monthly Intensive', features: ['Full Module Coverage', 'Study Materials', '4 Tests'], deliveryTime: '30 Days' },
                    { name: 'Premium', price: 12000, description: 'Quarterly Success Plan', features: ['Personal Mentorship', 'All Subject Access', 'Parent-Teacher Meets'], deliveryTime: '90 Days' }
                ],
                images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226016' },
                geoCoordinates: { type: 'Point', coordinates: [80.9812, 26.8811] },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'Global English & IELTS Academy',
                category: 'Tutors',
                businessType: 'service',
                targetGender: 'unisex',
                experience: 15,
                jobsCompleted: 300,
                description: 'Master the English language with certified trainers. Special batches for IELTS, TOEFL, and Corporate Communication skills.',
                servicesIncluded: ['Spoken English', 'IELTS Preparation', 'Grammar Fundamentals', 'Resume Writing'],
                price: 800,
                priceType: 'hourly',
                images: ['https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9992, 26.8467] },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'Full-Stack Coding & Tech Bootcamp',
                category: 'Tutors',
                businessType: 'service',
                targetGender: 'unisex',
                experience: 6,
                jobsCompleted: 150,
                description: 'Live project-based coding classes for MERN stack, Python, and Data Structures. Get placement ready with our industry experts.',
                servicesIncluded: ['React & Node.js', 'Python for AI', 'Database Management', 'Github & Deployment'],
                price: 2500,
                priceType: 'starting_at',
                images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226024' },
                geoCoordinates: { type: 'Point', coordinates: [80.9412, 26.8911] },
                isActive: true,
                isApproved: true
            },
            {
                provider: user._id,
                title: 'Scholars Academic Book Hub',
                category: 'Tutors',
                businessType: 'shop',
                targetGender: 'unisex',
                experience: 20,
                jobsCompleted: 5000,
                description: 'A dedicated store for all tutoring needs. We stock engineering drawings, medical journals, and high-quality study stationery.',
                servicesIncluded: ['New & Used Textbooks', 'Engineering Instruments', 'Reference Journals', 'Stationery Delivery'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'University Road Market', zipCode: '226007' },
                geoCoordinates: { type: 'Point', coordinates: [80.9420, 26.8620] },
                shopDetails: {
                    shopName: 'Scholars Hub',
                    shopAge: 20,
                    openingTime: '09:00 AM',
                    closingTime: '08:00 PM',
                    isHomeDelivery: true
                },
                isActive: true,
                isApproved: true
            }
        ];

        const created = await Service.insertMany(tutorGigs);
        console.log(`Successfully added ${created.length} Tutor profiles for ${targetEmail}`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating tutor gigs:', error);
        process.exit(1);
    }
};

createTutorGigs();
