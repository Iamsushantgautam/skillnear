import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import CategoryBanners from '../components/CategoryBanners';
import Hero, { mainCategories } from '../components/home/Hero';
import HomeCategories from '../components/home/HomeCategories';
import AdBanner from '../components/home/AdBanner';
import allCategoryLineup from '../assets/catg/allCategoryLineup.png';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';


const Home = () => {
    const { user, userLocation, setLocation, toggleFavorite } = useAuthStore();
    const [servicesByCategory, setServicesByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [globalSearch, setGlobalSearch] = useState('');
    const navigate = useNavigate();


    // Auto-detect location on mount if not set
    useEffect(() => {
        const detectLocation = async () => {
            // Only auto-detect if location is "All of India" or not set
            if ((!userLocation?.city || userLocation?.city === 'All of India') && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                        const data = await res.json();
                        if (data.address) {
                            const city = data.address.city || data.address.town || data.address.village || '';
                            const state = data.address.state || '';
                            const pincode = data.address.postcode || '';

                            // Update store and localStorage
                            setLocation({ city, state, pincode });

                            // If logged in, update backend
                            if (user?.token) {
                                try {
                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                    await api.put('/api/users/location', { lat: latitude, lng: longitude, city, state, pincode }, config);
                                } catch (err) { console.error("Auto-sync to DB failed", err); }
                            }
                            toast.success(`Welcome to ${city}! Showing local services.`);
                        }
                    } catch (err) { console.error("Reverse geocode failed", err); }
                });
            }
        };
        detectLocation();
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            const city = userLocation?.city;

            // If no location is selected, don't fetch (or handle differently)
            if (!city || city === 'All of India') {
                setServicesByCategory({});
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch services filtered by current user city
                const { data } = await api.get(`/api/services?location=${city}`);

                const grouped = data.reduce((acc, curr) => {
                    // Normalize category name for case-insensitive grouping
                    const rawCat = curr.category || 'Other';
                    const matchedCat = mainCategories.find(c => c.name.toLowerCase() === rawCat.toLowerCase());
                    const cat = matchedCat ? matchedCat.name : rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
                    
                    if (!acc[cat]) acc[cat] = [];
                    if (acc[cat].length < 10) acc[cat].push(curr);
                    return acc;
                }, {});
                setServicesByCategory(grouped);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, [userLocation]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!globalSearch.trim()) return navigate('/services');

        // Smart Parsing: Extract 6-digit pincode if present
        const pincodeMatch = globalSearch.match(/\b\d{6}\b/);
        const pincode = pincodeMatch ? pincodeMatch[0] : '';
        const keyword = globalSearch.replace(/\b\d{6}\b/, '').trim();

        let url = '/services?';
        if (keyword) url += `keyword=${keyword}&`;
        if (pincode) url += `pincode=${pincode}`;
        navigate(url);
    };

    return (
        <div style={{ backgroundColor: '#fff', overflowX: 'hidden' }}>

            <Hero 
                globalSearch={globalSearch} 
                setGlobalSearch={setGlobalSearch} 
                handleSearch={handleSearch} 
            />

            {/* CATEGORY BANNERS SECTION */}
            <CategoryBanners />

            <HomeCategories 
                loading={loading}
                userLocation={userLocation}
                servicesByCategory={servicesByCategory}
                mainCategories={mainCategories}
                user={user}
                toggleFavorite={toggleFavorite}
            />

            <AdBanner image={allCategoryLineup} />
        </div>
    );
};


export default Home;
