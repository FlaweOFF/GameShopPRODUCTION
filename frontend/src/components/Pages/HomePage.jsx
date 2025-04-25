// src/components/Pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import GameCarousel from '../Features/Game/GameCarousel';
import GameCard from '../Features/Game/GameCard';
import CategoryList from '../Features/Category/CategoryList';
import { fetchFeaturedGames, fetchWeeklyDiscounts, fetchBestsellers } from '../../store/gameSlice';
import { fetchCategories } from '../../store/categorySlice';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredGames, weeklyDiscounts, bestsellers, loading } = useSelector(state => state.games);
  const { categories } = useSelector(state => state.categories);
  const [backgroundImage, setBackgroundImage] = useState('');
  
  useEffect(() => {
    dispatch(fetchFeaturedGames());
    dispatch(fetchWeeklyDiscounts());
    dispatch(fetchBestsellers());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  useEffect(() => {
    // Set background image from the middle featured game
    if (Array.isArray(featuredGames) && featuredGames.length >= 3) {
      setBackgroundImage(featuredGames[1].backgroundImageUrl);
    } else if (Array.isArray(featuredGames) && featuredGames.length > 0) {
      setBackgroundImage(featuredGames[0].backgroundImageUrl);
    }
  }, [featuredGames]);
  
  if (loading === 'pending') {
    return <div className="loading">Loading...</div>;
  }

  // Make sure we properly handle empty or non-array data
  const safeWeeklyDiscounts = Array.isArray(weeklyDiscounts) ? weeklyDiscounts : [];
  const safeBestsellers = Array.isArray(bestsellers) ? bestsellers : [];
  
  return (
    <div className="home-page">
      {/* Featured Games Section */}
      <section 
        className="featured-games-section"
        style={{
          backgroundImage: backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="fire-icon">🔥</span> Горячие новинки
          </h2>
        </div>
        
        <GameCarousel games={featuredGames} />
      </section>
      
      {/* Weekly Discounts Section */}
      <section 
        className="weekly-discounts-section"
        style={{
          backgroundImage: safeWeeklyDiscounts.length > 0 && safeWeeklyDiscounts[0].backgroundImageUrl
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${safeWeeklyDiscounts[0].backgroundImageUrl})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="discount-icon">⚙️</span> Скидки этой недели
          </h2>
          <a href="/discounts" className="see-all-link">Все</a>
        </div>
        
        <div className="games-grid">
          {safeWeeklyDiscounts.slice(0, 6).map(game => (
            <div key={game._id || game.id} className="game-card-container">
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </section>
      
      {/* Bestsellers Section */}
      <section 
        className="bestsellers-section"
        style={{
          backgroundImage: safeBestsellers.length > 0 && safeBestsellers[0].backgroundImageUrl
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${safeBestsellers[0].backgroundImageUrl})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="section-header">
          <h2 className="section-title">
            <span className="trophy-icon">🏆</span> Бестселлеры недели
          </h2>
          <a href="/bestsellers" className="see-all-link">Все</a>
        </div>
        
        <div className="games-grid">
          {safeBestsellers.slice(0, 6).map(game => (
            <div key={game._id || game.id} className="game-card-container">
              <GameCard game={game} />
            </div>  
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;