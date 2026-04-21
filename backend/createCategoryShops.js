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
    shopDetails: {
        shopName: String,
        shopAge: Number,
        shopDescription: String,
        shopCategories: [String],
    },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }
});
const Service = mongoose.model('Service', serviceSchema);

const createCategoryShops = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const targetEmail = 'gautamlko8765@gmail.com';
        const user = await User.findOne({ email: targetEmail });
        if (!user) { process.exit(1); }

        const shops = [
            {
                provider: user._id,
                title: 'Elite Salon & Spa Supplies',
                category: 'Salon',
                businessType: 'shop',
                experience: 15,
                jobsCompleted: 3000,
                description: 'Lucknow\'s premier destination for professional salon equipment and luxury spa products. We supply top-tier tools for hair stylists and makeup artists.',
                servicesIncluded: ['Professional Equipment', 'Bulk Supply', 'Original Brand Products', 'Delivery'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Hazratganj Mall', zipCode: '226001' },
                geoCoordinates: { type: 'Point', coordinates: [80.9462, 26.8467] },
                shopDetails: { shopName: 'Elite Salon Supplies', shopAge: 15, shopDescription: 'Professional salon & beauty hub', shopCategories: ['Beauty', 'Tools'] }
            },
            {
                provider: user._id,
                title: 'The Woodwork Depot',
                category: 'Carpenters',
                businessType: 'shop',
                experience: 25,
                jobsCompleted: 7000,
                description: 'Specialized shop for premium Teak, Sheesham, and Ply. We also stock advanced woodworking machinery and high-grade finishes.',
                servicesIncluded: ['Premium Timber', 'Woodworking Tools', 'Custom Cutting', 'Home Delivery'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Aishbagh Wood Market', zipCode: '226004' },
                geoCoordinates: { type: 'Point', coordinates: [80.9112, 26.8311] },
                shopDetails: { shopName: 'The Woodwork Depot', shopAge: 25, shopDescription: 'Premium timber and tool warehouse', shopCategories: ['Hardware', 'Lumber'] }
            },
            {
                provider: user._id,
                title: 'FlowMaster Plumbing Hub',
                category: 'Plumbers',
                businessType: 'shop',
                experience: 12,
                jobsCompleted: 2500,
                description: 'Complete plumbing solutions store. From luxury bath fittings to industrial pipes and advanced leak detection tech.',
                servicesIncluded: ['Branded Fittings', 'PVC & CPVC Pipes', 'Sensor Faucets', 'Industrial Pumps'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Charbagh Industrial Area', zipCode: '226004' },
                geoCoordinates: { type: 'Point', coordinates: [80.9167, 26.8333] },
                shopDetails: { shopName: 'FlowMaster Hub', shopAge: 12, shopDescription: 'Sanitary and hardware specialists', shopCategories: ['Sanitary', 'Pipes'] }
            },
            {
                provider: user._id,
                title: 'VoltTech Electricals',
                category: 'Electricians',
                businessType: 'shop',
                experience: 10,
                jobsCompleted: 5000,
                description: 'Modern electrical goods for smart homes. We stock IoT switches, high-efficiency solar panels, and premium wiring solutions.',
                servicesIncluded: ['Smart Home Switches', 'Solar Panels', 'Industrial Wiring', 'LED Solutions'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1558444029-f1fbbdc503d9?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Aminabad Market', zipCode: '226018' },
                geoCoordinates: { type: 'Point', coordinates: [80.9312, 26.8511] },
                shopDetails: { shopName: 'VoltTech Electricals', shopAge: 10, shopDescription: 'Electrical & Lighting Showroom', shopCategories: ['Electronics', 'Wiring'] }
            },
            {
                provider: user._id,
                title: 'PureSparkle Cleaning Store',
                category: 'Cleaning',
                businessType: 'shop',
                experience: 6,
                jobsCompleted: 1200,
                description: 'Eco-friendly cleaning supplies and mechanized equipment. Rent or buy industrial extractors, air purifiers, and bio-degradable solutions.',
                servicesIncluded: ['Eco-Friendly Solutions', 'Robot Vacuums', 'Air Purifiers', 'Rental Equipment'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Indira Nagar, Sector 10', zipCode: '226016' },
                geoCoordinates: { type: 'Point', coordinates: [80.9812, 26.8811] },
                shopDetails: { shopName: 'PureSparkle Store', shopAge: 6, shopDescription: 'Smart Cleaning solutions hub', shopCategories: ['Laundry', 'Home Care'] }
            },
            {
                provider: user._id,
                title: 'Arctic Comfort - AC Store',
                category: 'AC Repair',
                businessType: 'shop',
                experience: 18,
                jobsCompleted: 8000,
                description: 'Authorized retailer for top air conditioning brands. We also provide genuine spare parts, compressors, and specialized AC cleaning chemicals.',
                servicesIncluded: ['Inverter AC Units', 'Central Cooling Systems', 'Genuine Spare Parts', 'Installation Kits'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1626084300762-5f7a34241285?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Aliganj Main Road', zipCode: '226024' },
                geoCoordinates: { type: 'Point', coordinates: [80.9412, 26.8911] },
                shopDetails: { shopName: 'Arctic Comfort', shopAge: 18, shopDescription: 'AC Showroom & Parts Hub', shopCategories: ['Appliances', 'HVAC'] }
            },
            {
                provider: user._id,
                title: 'Spectrum Paints & Decor',
                category: 'Painters',
                businessType: 'shop',
                experience: 30,
                jobsCompleted: 15000,
                description: 'Experience Lucknow\'s largest color mixing studio. We offer computerized matching for over 50,000 shades and premium Italian textures.',
                servicesIncluded: ['Computerized Color Mix', 'Designer Textures', 'Waterproofing Paints', 'Free Sample Tinting'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Gomti Nagar, Ext-1', zipCode: '226010' },
                geoCoordinates: { type: 'Point', coordinates: [80.9992, 26.8467] },
                shopDetails: { shopName: 'Spectrum Decor', shopAge: 30, shopDescription: 'Premium Color & Texture Studio', shopCategories: ['Paint', 'Decor'] }
            },
            {
                provider: user._id,
                title: 'The Knowledge Bookshop',
                category: 'Tutors',
                businessType: 'shop',
                experience: 40,
                jobsCompleted: 20000,
                description: 'Historic bookshop specializing in competitive exam materials, academic textbooks, and high-quality stationery for scholars.',
                servicesIncluded: ['Exam Materials', 'Academic Textbooks', 'Fine Stationery', 'Home Delivery'],
                price: 0,
                priceType: 'fixed',
                images: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop'],
                location: { city: 'Lucknow', state: 'Uttar Pradesh', address: 'Lucknow University Road', zipCode: '226007' },
                geoCoordinates: { type: 'Point', coordinates: [80.9412, 26.8611] },
                shopDetails: { shopName: 'The Knowledge Hub', shopAge: 40, shopDescription: 'Academic and stationery emporium', shopCategories: ['Books', 'Education'] }
            }
        ];

        const created = await Service.insertMany(shops);
        console.log(`Successfully added ${created.length} specialty shops for each category to ${targetEmail}`);
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createCategoryShops();
