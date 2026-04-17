import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import { Toaster } from 'react-hot-toast';
import './App.css';

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

function NavConditional() {
  const location = useLocation();
  // Do not show botton nav on Home Page
  if (location.pathname === '/') return null;
  return <MobileNav />;
}

function MainLayout() {
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
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
      <NavConditional />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
