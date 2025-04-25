import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector(state => state.cart.items);
  
  const isActive = (path) => {
    return location.pathname === path ? 'footer__nav-item--active' : '';
  };
  
  return (
    <footer className="footer">
      <nav className="footer__nav">
        <div 
          className={`footer__nav-item ${isActive('/')}`}
          onClick={() => navigate('/')}
        >
          <span className="footer__nav-icon">🏠</span>
          <span className="footer__nav-text">Главная</span>
        </div>
        
        <div 
          className={`footer__nav-item ${isActive('/wishlist')}`}
          onClick={() => navigate('/wishlist')}
        >
          <span className="footer__nav-icon">❤️</span>
          <span className="footer__nav-text">Желания</span>
        </div>
        
        <div 
          className={`footer__nav-item ${isActive('/cart')}`}
          onClick={() => navigate('/cart')}
        >
          <span className="footer__nav-icon">🛒</span>
          {cartItems.length > 0 && (
            <span className="footer__nav-badge">{cartItems.length}</span>
          )}
          <span className="footer__nav-text">Корзина</span>
        </div>
        
        <div 
          className={`footer__nav-item ${isActive('/profile')}`}
          onClick={() => navigate('/profile')}
        >
          <span className="footer__nav-icon">👤</span>
          <span className="footer__nav-text">Профиль</span>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;