import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';
import User from './models/User.js';

dotenv.config();

const createBulkHomeServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.error(`User ${targetEmail} not found`);
            process.exit(1);
        }

        const gigs = [];

        // 3 Plumbers
        for (let i = 1; i <= 3; i++) {
            gigs.push({
                provider: user._id,
                title: `Expert Plumbing Solution ${i}`,
                category: 'Plumbers',
                businessType: 'service',
                description: `Professional plumbing services including leak repairs, pipe installations, and bathroom fittings. We guarantee quality work.`,
                servicesIncluded: ['Leak Detection', 'Pipe Repair', 'Tap Installation', 'Drain Cleaning'],
                price: 200 + (i * 50),
                priceType: 'fixed',
                images: [`https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070`],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' },
                geoCoordinates: { type: 'Point', coordinates: [80.9462 + (i * 0.01), 26.8467 + (i * 0.01)] },
                isActive: true,
                isApproved: true
            });
        }

        // 3 Electricians
        for (let i = 1; i <= 3; i++) {
            gigs.push({
                provider: user._id,
                title: `Master Electrician Pro ${i}`,
                category: 'Electricians',
                businessType: 'service',
                description: `Complete electrical wiring and repair experts. We handle everything from short circuits to new home installations.`,
                servicesIncluded: ['Full Home Wiring', 'Panel Repair', 'Inverter Setup', 'Appliance Repair'],
                price: 150 + (i * 100),
                priceType: 'fixed',
                images: [`https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071`],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9992 - (i * 0.01), 26.8467 + (i * 0.01)] },
                isActive: true,
                isApproved: true
            });
        }

        // 3 Carpenters
        for (let i = 1; i <= 3; i++) {
            gigs.push({
                provider: user._id,
                title: `Signature Woodworks ${i}`,
                category: 'Carpenters',
                businessType: 'service',
                description: `Custom furniture and repair experts. We create beautiful wooden structures tailored to your home needs.`,
                servicesIncluded: ['Furniture Repair', 'Custom Cabinets', 'Door Installation', 'Wood Polishing'],
                price: 300 + (i * 200),
                priceType: 'starting_at',
                images: [`https://images.unsplash.com/photo-1601058268499-e52658b97d2c?q=80&w=2070`],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226016' },
                geoCoordinates: { type: 'Point', coordinates: [80.9812 + (i * 0.005), 26.8811 - (i * 0.005)] },
                isActive: true,
                isApproved: true
            });
        }

        // 6 Painters
        const painterImages = [
            'https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=2070',
            'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070',
            'https://images.unsplash.com/photo-1595844730298-b9f0ff9830ca?q=80&w=2070',
            'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=2070',
            'https://images.unsplash.com/photo-1534349762230-e09ca9823b43?q=80&w=2070',
            'https://images.unsplash.com/photo-1507089947368-19c1ad164c33?q=80&w=2070'
        ];
        for (let i = 1; i <= 6; i++) {
            gigs.push({
                provider: user._id,
                title: `Spectrum Wall Decorator ${i}`,
                category: 'Painters',
                businessType: 'service',
                description: `Transform your home with our painting services. We offer texture paints, waterproofing, and high-gloss finishes.`,
                servicesIncluded: ['Interior Painting', 'Exterior Painting', 'Wall Textures', 'Waterproofing'],
                price: 15 + (i * 5), // Per sq ft maybe?
                priceType: 'starting_at',
                images: [painterImages[i-1]],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226004' },
                geoCoordinates: { type: 'Point', coordinates: [80.9167 + (i * 0.002), 26.8333 + (i * 0.002)] },
                isActive: true,
                isApproved: true
            });
        }

        // 5 Cleaning
        const cleaningImages = [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6959?q=80&w=2070',
            'https://images.unsplash.com/photo-1528740561666-dc2479da08ad?q=80&w=2070',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070',
            'https://images.unsplash.com/photo-1585421515284-d9797f14846e?q=80&w=2070',
            'https://images.unsplash.com/photo-1507652313519-d4c9174996dd?q=80&w=2070'
        ];
        for (let i = 1; i <= 5; i++) {
            gigs.push({
                provider: user._id,
                title: `Deep Cleaning Experts ${i}`,
                category: 'Cleaning',
                businessType: 'service',
                description: `Complete home and office deep cleaning services using professional equipment and sanitized solutions.`,
                servicesIncluded: ['Full House Cleaning', 'Sofa & Carpet Cleaning', 'Kitchen Sanitation', 'Bathroom Scrubbing'],
                price: 800 + (i * 200),
                priceType: 'fixed',
                images: [cleaningImages[i-1]],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226024' },
                geoCoordinates: { type: 'Point', coordinates: [80.9412 - (i * 0.003), 26.8911 - (i * 0.003)] },
                isActive: true,
                isApproved: true
            });
        }

        const created = await Service.insertMany(gigs);
        console.log(`Successfully added ${created.length} home service profiles for ${targetEmail}`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createBulkHomeServices();
