import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGamesByCategory } from '../../store/gameSlice';
import GameCard from '../Features/Game/GameCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categoryGames, loading, error } = useSelector(state => state.games);
  const { categories } = useSelector(state => state.categories);
  
  useEffect(() => {
    dispatch(fetchGamesByCategory(id));
  }, [dispatch, id]);
  
  // Find the current category
  const currentCategory = categories.find(cat => cat.id === id) || { name: 'Категория' };
  
  if (loading === 'pending') {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error-message">Failed to load games for this category</div>;
  }
  
  return (
    <div className="category-page">
      <div className="category-page__header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h1 className="category-page__title">{currentCategory.name}</h1>
        <div className="category-page__action-placeholder"></div>
      </div>
      
      <div className="category-page__content">
        {categoryGames.length > 0 ? (
          <div className="category-games-grid">
            {categoryGames.map(game => (
              <div key={game.id} className="game-card-container">
                <GameCard game={game} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-category">
            <p>Нет игр в данной категории</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;