import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AdminServices from './pages/AdminServices';
import Bookings from './pages/Bookings';
import Transactions from './pages/Transactions';
import UserDetails from './pages/UserDetails';
import UserGallery from './pages/UserGallery';
import MediaGallery from './pages/MediaGallery';
import UserTransactions from './pages/UserTransactions';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import useAuthStore from './store/useAuthStore';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Routes wrapping in Layout */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<ErrorBoundary><UserDetails /></ErrorBoundary>} />
          <Route path="users/:id/gallery" element={<UserGallery />} />
          <Route path="gallery" element={<MediaGallery />} />
          <Route path="users/:id/transactions" element={<UserTransactions />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="categories" element={<AdminServices />} />
          <Route path="activity" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<div style={{ padding: '40px' }}><h2>Reports — coming soon</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
