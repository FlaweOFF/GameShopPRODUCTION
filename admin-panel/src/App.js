import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import adminApiService from './services/adminApiService';

// Layout component
import AdminLayout from './components/Layout/AdminLayout';

// Page components
import LoginPage from './components/Pages/LoginPage';
import Dashboard from './components/Pages/Dashboard';
import GamesList from './components/Pages/GamesList';
import GameForm from './components/Pages/GameForm';
import CategoriesList from './components/Pages/CategoriesList';
import CategoryForm from './components/Pages/CategoryForm';
import OrdersList from './components/Pages/OrdersList';
import OrderDetails from './components/Pages/OrderDetails';
import GameScraper from './components/Pages/GameScraper';
import StoreSettings from './components/Pages/StoreSettings';

// Component to check if user is authenticated
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verify token by fetching profile
        await adminApiService.getProfile();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="games" element={<GamesList />} />
        <Route path="games/add" element={<GameForm />} />
        <Route path="games/edit/:id" element={<GameForm />} />
        <Route path="categories" element={<CategoriesList />} />
        <Route path="categories/add" element={<CategoryForm />} />
        <Route path="categories/edit/:id" element={<CategoryForm />} /> 
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="scraper" element={<GameScraper />} />
        <Route path="settings" element={<StoreSettings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default App;