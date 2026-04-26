import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import CategoryBanners from '../components/home/CategoryBanners';
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

    const [locationContext, setLocationContext] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            const city = userLocation?.city;
            const pincode = userLocation?.pincode;
            const state = userLocation?.state;

            setLoading(true);
            try {
                let finalData = [];
                let context = '';

                // CASCADE 1: Pincode
                if (pincode) {
                    const { data } = await api.get(`/api/services?pincode=${pincode}`);
                    if (data.length > 0) {
                        finalData = data;
                        context = `your Pincode (${pincode})`;
                    }
                }

                // CASCADE 2: City (if pincode failed or not available)
                if (finalData.length === 0 && city && city !== 'All of India') {
                    const { data } = await api.get(`/api/services?location=${city}`);
                    if (data.length > 0) {
                        finalData = data;
                        context = `your City (${city})`;
                    }
                }

                // CASCADE 3: State (if city failed)
                if (finalData.length === 0 && state) {
                    // Note: We need to make sure backend handles state search. 
                    // For now we'll reuse the 'location' param if backend supports state there, 
                    // or we might need a new 'state' param.
                    const { data } = await api.get(`/api/services?location=${state}`);
                    if (data.length > 0) {
                        finalData = data;
                        context = `your State (${state})`;
                    }
                }

                // CASCADE 4: All of India
                if (finalData.length === 0) {
                    const { data } = await api.get(`/api/services`);
                    finalData = data;
                    context = `all of India`;
                }

                const grouped = finalData.reduce((acc, curr) => {
                    const rawCat = curr.category || 'Other';
                    const matchedCat = mainCategories.find(c => c.name.toLowerCase() === rawCat.toLowerCase());
                    const cat = matchedCat ? matchedCat.name : rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
                    
                    if (!acc[cat]) acc[cat] = [];
                    if (acc[cat].length < 10) acc[cat].push(curr);
                    return acc;
                }, {});

                setServicesByCategory(grouped);
                setLocationContext(context);
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
                locationContext={locationContext}
            />

            <AdBanner image={allCategoryLineup} />
        </div>
    );
};


export default Home;
