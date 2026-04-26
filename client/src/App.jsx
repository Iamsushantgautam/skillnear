import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import BookingFlow from './pages/BookingFlow';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import ShopFinder from './pages/ShopFinder';
import PublicProfile from './pages/PublicProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import HowItWorks from './pages/HowItWorks';
import SuccessStories from './pages/SuccessStories';
import ProviderGuidelines from './pages/ProviderGuidelines';
import Invoice from './pages/Invoice';

import useAuthStore from './store/useAuthStore';
import api from './utils/api';
import { toast } from 'react-hot-toast';

function MainLayout() {
  const { user, userLocation, setLocation } = useAuthStore();

  // Global auto-detect location on every mount
  useEffect(() => {
    const detectLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || '';
              const state = data.address.state || '';
              const pincode = data.address.postcode || '';

              // Only update if it's actually different to avoid redundant toasts
              if (city !== userLocation?.city) {
                setLocation({ city, state, pincode });

                // If logged in, update backend
                if (user?.token) {
                  try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    await api.put('/api/users/location', { lat: latitude, lng: longitude, city, state, pincode }, config);
                  } catch (err) { console.error("Auto-sync to DB failed", err); }
                }
                toast.success(`Location updated to ${city}`);
              }
            }
          } catch (err) { console.error("Reverse geocode failed", err); }
        }, (err) => {
            console.error("Geolocation failed:", err);
            // Optionally notify user if permissions are off
        }, { enableHighAccuracy: true });
      }
    };
    detectLocation();
  }, []); // Empty dependency means it runs on first visit/hard refresh

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shops" element={<ShopFinder />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/book/:id" element={<BookingFlow />} />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/provider-guidelines" element={<ProviderGuidelines />} />
          <Route path="/invoice/:id" element={<Invoice />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
