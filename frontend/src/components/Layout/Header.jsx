import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTelegram } from '../../hooks/useTelegram';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { telegram } = useTelegram();
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useSelector(state => state.cart.items);
  
  // Don't show header on game details page
  const isGameDetailsPage = location.pathname.startsWith('/game/');
  if (isGameDetailsPage) {
    return null;
  }
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleCartClick = () => {
    navigate('/cart');
  };
  
  return (
    <header className="header">
      <div className="header__top">
        <h1 className="header__title">PG Store - удобная покупка</h1>
        <button className="header__menu-button">
          ⋮
        </button>
      </div>
      
      <div className="header__search">
        <form onSubmit={handleSearchSubmit}>
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск игр..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;