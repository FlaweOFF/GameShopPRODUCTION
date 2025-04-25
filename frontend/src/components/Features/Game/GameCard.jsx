import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import './GameCard.css';

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleCardClick = () => {
    navigate(`/game/${game._id || game.id}`);
  };
  
  const calculateDiscountPercentage = () => {
    if (!game.discountPercentage) {
      return '';
    }
    return game.discountPercentage.replace('%', '').trim();
  };
  
  return (
    <div className="game-card" onClick={handleCardClick}>
      <div className="game-card__image-container">
        <img 
          src={game.imageUrl} 
          alt={game.title}
          className="game-card__image"
        />
        
        {game.discountPercentage && (
          <div className="game-card__discount-badge">
            -{calculateDiscountPercentage()}%
          </div>
        )}
        
        {game.likes && (
          <div className="game-card__likes">
            ❤️ {game.likes}
          </div>
        )}
      </div>
      
      <div className="game-card__info">
        <h3 className="game-card__title">{game.title}</h3>
        
        <div className="game-card__price-container">
          {game.discountPrice && game.discountPrice !== game.originalPrice ? (
            <>
              <span className="game-card__discount-price">{game.discountPrice} ₽</span>
              <span className="game-card__original-price">{game.originalPrice} ₽</span>
            </>
          ) : (
            <span className="game-card__price">{game.originalPrice} ₽</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;