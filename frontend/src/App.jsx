// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useTelegram } from './hooks/useTelegram';
import Layout from './components/Layout/Layout';
import HomePage from './components/Pages/HomePage';
import GamePage from './components/Pages/GamePage';
import CartPage from './components/Pages/CartPage';
import CategoryPage from './components/Pages/CategoryPage';
import store from './store/store';
import './App.css';

function App() {
  const { telegram } = useTelegram();
  
  useEffect(() => {
    // Set background color based on Telegram theme
    if (telegram) {
      document.body.style.backgroundColor = telegram.backgroundColor;
    }
  }, [telegram]);
  
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GamePage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;