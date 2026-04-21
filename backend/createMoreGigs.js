import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const userSchema = new mongoose.Schema({ email: String, role: String });
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
    location: { city: String, state: String, address: String, zipCode: String },
    geoCoordinates: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }
});
const Service = mongoose.model('Service', serviceSchema);

const createMoreGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });
        if (!user) { process.exit(1); }

        const moreGigs = [
            {
                provider: user._id,
                title: 'Professional Painters - Full Home Refresh',
                category: 'Painters',
                businessType: 'service',
                experience: 10,
                jobsCompleted: 450,
                description: 'Transform your living space with our premium painting services. We specialize in luxury textures, waterproof exterior coatings, and artistic accent walls. Using only top-tier eco-friendly paints for a long-lasting finish.',
                servicesIncluded: ['Full Interior/Exterior Painting', 'Textured Walls & Wallpaper', 'Wood & Metal Polishing', 'Waterproofing Solutions'],
                price: 18000,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Gomti Nagar, Near Marine Drive', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9992, 26.8467] }
            },
            {
                provider: user._id,
                title: 'Expert Cleaning - Deep Home Sanitization',
                category: 'Cleaning',
                businessType: 'service',
                experience: 8,
                jobsCompleted: 920,
                description: 'Premium mechanized deep cleaning and sanitization. We use hospital-grade disinfectants and powerful vacuum systems to ensure your home is free from dust, allergens, and bacteria. Specialized in high-end upholstery.',
                servicesIncluded: ['Mechanized Deep Cleaning', 'Sofa & Carpet Shampooing', 'Kitchen & Bathroom Sanitization', 'Window & Facade Cleaning'],
                price: 2499,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Hazratganj, Central Lucknow', zipCode: '226001' },
                geoCoordinates: { type: 'Point', coordinates: [80.9462, 26.8467] }
            },
            {
                provider: user._id,
                title: 'Turbo Cooling - Advanced AC Service',
                category: 'AC Repair',
                businessType: 'service',
                experience: 11,
                jobsCompleted: 1500,
                description: 'Expert air conditioning repair and maintenance for split and window units. Our advanced jet-washing technology ensures 30% better cooling. Certified technicians for PCB repairs and gas leakage detection.',
                servicesIncluded: ['Advanced Jet Wash Service', 'Gas Charging & Leak Fix', 'PCB & Compressor Repair', 'New AC Installation'],
                price: 599,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1554441589-ee71a9aae833?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Aliganj, Sector B', zipCode: '226024' },
                geoCoordinates: { type: 'Point', coordinates: [80.9412, 26.8911] }
            },
            {
                provider: user._id,
                title: 'Premium Tutors - IIT-JEE & Boards',
                category: 'Tutors',
                businessType: 'service',
                experience: 14,
                jobsCompleted: 210,
                description: 'Top-tier home and online tuition for Mathematics and Physics. Expert coaching for IIT-JEE, NEET, and CBSE/ISC boards. We focus on conceptual clarity and rigorous problem-solving techniques for academic excellence.',
                servicesIncluded: ['Personalized Study Plan', 'Weekly Mock Tests', 'Career Counseling', 'Doubt Clearing Sessions'],
                price: 1500,
                priceType: 'hourly',
                images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Mahanagar, Near Montfort', zipCode: '226006' },
                geoCoordinates: { type: 'Point', coordinates: [80.9532, 26.8778] }
            },
            {
                provider: user._id,
                title: 'High-Tech Electronics - Precision Repair',
                category: 'Other',
                businessType: 'service',
                experience: 9,
                jobsCompleted: 1100,
                description: 'Precision repair for modern electronics including Smart TVs, Microwaves, and Gaming Consoles. We use original spare parts and provide a 90-day warranty on all repairs. Same-day diagnostics available.',
                servicesIncluded: ['Smart TV Screen Repair', 'Inverter & UPS Service', 'Microwave Magnetron Replacement', 'Gaming Console Rebuild'],
                price: 499,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'LDA Colony, Kanpur Road', zipCode: '226012' },
                geoCoordinates: { type: 'Point', coordinates: [80.9012, 26.7911] }
            },
            {
                provider: user._id,
                title: 'Fresh Harvest Grocery - Shop & Home Delivery',
                category: 'Other',
                businessType: 'shop',
                experience: 20,
                jobsCompleted: 5000,
                description: 'Your neighborhood hub for fresh organic produce, imported pantry staples, and daily essentials. Proudly serving Lucknow for over 20 years. We offer 30-minute express home delivery in nearby sectors.',
                servicesIncluded: ['Express Home Delivery', 'Monthly Ration Booking', 'Organic Produce Supply', 'Fresh Dairy & Bakery'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Chowk Market, Old Lucknow', zipCode: '226003' },
                geoCoordinates: { type: 'Point', coordinates: [80.9167, 26.8667] }
            }
        ];

        const created = await Service.insertMany(moreGigs);
        console.log(`Successfully added ${created.length} new professional gigs to ${targetEmail}`);
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createMoreGigs();
