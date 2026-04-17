import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Service from './models/Service.js';

dotenv.config();

// Very granular local locations to test the hyper-local tracking
const localLocations = [
  { city: 'Mumbai', state: 'Maharashtra', zip: '400053', localArea: 'Andheri West', street: 'Link Road, Lokhandwala Complex' },
  { city: 'Bangalore', state: 'Karnataka', zip: '560034', localArea: 'Koramangala', street: '80 Feet Road, 4th Block Koramangala' },
  { city: 'Delhi', state: 'Delhi', zip: '110001', localArea: 'Connaught Place', street: 'Inner Circle, B Block, CP' },
  { city: 'Pune', state: 'Maharashtra', zip: '411014', localArea: 'Viman Nagar', street: 'Datta Mandir Road, Viman Nagar' },
  { city: 'Hyderabad', state: 'Telangana', zip: '500033', localArea: 'Banjara Hills', street: 'Road No. 12, Banjara Hills' },
  { city: 'Chennai', state: 'Tamil Nadu', zip: '600040', localArea: 'Anna Nagar', street: '2nd Avenue, Anna Nagar East' },
  { city: 'Noida', state: 'Uttar Pradesh', zip: '201309', localArea: 'Sector 62', street: 'Electronic City, Sector 62' },
  { city: 'Gurgaon', state: 'Haryana', zip: '122002', localArea: 'Cyber City', street: 'DLF Phase 2, Near Cyber Hub' },
  { city: 'Kolkata', state: 'West Bengal', zip: '700016', localArea: 'Park Street', street: 'Mother Teresa Sarani, Park Street area' },
  { city: 'Ahmedabad', state: 'Gujarat', zip: '380015', localArea: 'Vastrapur', street: 'Near Vastrapur Lake' }
];

const categories = ['Carpenters', 'Plumbers', 'Electricians', 'Salon', 'Painters', 'Cleaning'];

const localDemoServices = [
  { title: 'Local Express Plumbing Fix', category: 'Plumbers', price: 200, priceType: 'fixed', shopName: 'Sharma Plumbing' },
  { title: 'Neighbourhood Electrician (24/7)', category: 'Electricians', price: 300, priceType: 'hourly', shopName: 'City Lights Electric' },
  { title: 'Boutique Beauty & Hair Salon', category: 'Salon', price: 1200, priceType: 'starting_at', shopName: 'Elegant Touch Beauty' },
  { title: 'Quick Carpentry & Assembly', category: 'Carpenters', price: 400, priceType: 'hourly', shopName: 'Woodcrafters' },
  { title: 'House Deep Cleaning Express', category: 'Cleaning', price: 900, priceType: 'fixed', shopName: 'Sparkle Cleaners' },
  { title: 'Expert Local Painting Services', category: 'Painters', price: 5000, priceType: 'starting_at', shopName: 'Color Splash Painters' },
  { title: 'AC Servicing & Repair', category: 'Electricians', price: 450, priceType: 'fixed', shopName: 'Cool Breeze AC Repair' },
  { title: 'Water Tank Cleaning', category: 'Cleaning', price: 500, priceType: 'fixed', shopName: 'Pure Water Services' },
  { title: 'Door & Window Fixer', category: 'Carpenters', price: 350, priceType: 'fixed', shopName: 'Local Carpenters Hub' },
  { title: 'Water Heater & Geyser Repair', category: 'Plumbers', price: 300, priceType: 'fixed', shopName: 'Quick Fix Plumbers' }
];

const images = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80'
];

async function seedLocal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const providers = [];
    
    // Seed detailed local shop owners
    for (let i = 0; i < localLocations.length; i++) {
        const loc = localLocations[i];
        const isShop = true; // Make them all local shops for better Shop Finder mapping
        const svcInfo = localDemoServices[i % localDemoServices.length];

        let providerData = {
            name: `${loc.localArea} Expert`,
            email: `local_${loc.localArea.toLowerCase().replace(/ /g, '_')}@skillnear.local`,
            password: hashedPassword,
            role: 'provider',
            address: { street: loc.street, city: loc.city, state: loc.state, zipCode: loc.zip },
            providerDetails: {
                providerType: 'Shop',
                title: svcInfo.title,
                experience: 3 + (i % 6),
                bio: `Dedicated completely to serving the ${loc.localArea} neighbourhood. Very fast response times for local residents.`,
                isApproved: true,
                liveLocation: loc.localArea,
                shopName: svcInfo.shopName || `${loc.localArea} Service Station`,
                shopAddress: `${loc.street}, ${loc.localArea}, ${loc.city} ${loc.zip}`,
                shopImages: [images[i % images.length], images[(i + 1) % images.length]]
            }
        };

        let existing = await User.findOne({ email: providerData.email });
        if (!existing) {
            existing = await User.create(providerData);
        } else {
            existing = await User.findOneAndUpdate({ email: providerData.email }, providerData, { new: true });
        }
        providers.push(existing);
    }
    console.log('Hyper-local providers spawned');

    // Create Hyper-local Services
    for (let i = 0; i < localDemoServices.length; i++) {
        const ds = localDemoServices[i];
        const provider = providers[i];
        const loc = localLocations[i];
        
        await Service.create({
            provider: provider._id,
            title: `${ds.title} in ${loc.localArea}`,
            category: ds.category,
            description: `Hyper-local ${ds.category.toLowerCase()} available within 2 KMs of ${loc.localArea}. We strictly operate around ${loc.street} to ensure lightning fast delivery.`,
            price: ds.price,
            priceType: ds.priceType,
            images: [images[i % images.length]],
            location: {
                city: loc.city,
                isRemote: false
            },
            isApproved: true,
            isActive: true
        });
    }
    console.log('Hyper-local Services seeded');

    // Link target user to some highly-specific local ones too
    const targetEmail = 'sushantgautamlk6393@gmail.com';
    let adminUser = await User.findOne({ email: targetEmail });
    if(adminUser) {
        // give admin one localized shop specifically
        await Service.create({
            provider: adminUser._id,
            title: `Sushant's Local Hub Express (Andheri)`,
            category: 'Electricians',
            description: `Personal localized shop setup located right in Andheri West. Quick 30-minute responses!`,
            price: 700,
            priceType: 'fixed',
            images: [images[2]],
            location: {
                city: 'Mumbai',
                isRemote: false
            },
            isApproved: true,
            isActive: true
        });
        
        // update admin local info to make it robust
        adminUser.address = {
            street: 'Link Road, Lokhandwala Complex',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400053'
        };
        adminUser.username = 'sushant';
        await adminUser.save();
    }

    console.log('✅ Hyper-local Data Injection complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedLocal();
