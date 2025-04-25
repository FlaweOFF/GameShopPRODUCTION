// src/components/Pages/GamePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGameDetails } from '../../store/gameSlice';
import { addToCart } from '../../store/cartSlice';
import { useTelegram } from '../../hooks/useTelegram';
import './GamePage.css';

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { game, loading, error } = useSelector(state => state.games.currentGame);
  const [selectedEdition, setSelectedEdition] = useState(null);
  
  useEffect(() => {
    dispatch(fetchGameDetails(id));
  }, [dispatch, id]);
  
  useEffect(() => {
    if (game) {
      // Если у игры есть редакции, выберем первую
      if (game.editions && game.editions.length > 0) {
        setSelectedEdition(game.editions[0]);
      } else {
        // Иначе создадим стандартную редакцию из основных данных игры
        setSelectedEdition({
          id: 'standard',
          name: 'Стандартное издание',
          originalPrice: game.originalPrice,
          discountPrice: game.discountPrice || game.originalPrice
        });
      }
    }
  }, [game]);
  
  // Форматирование скидки
  const formatDiscount = (discountStr) => {
    if (!discountStr) return '';
    // Убираем минус, если он есть
    return discountStr.replace('-', '').trim();
  };
  
  const handleAddToCart = () => {
    if (game && selectedEdition) {
      const price = selectedEdition.discountPrice || selectedEdition.originalPrice;
      dispatch(addToCart({
        id: `${game._id || game.id}-${selectedEdition.id || 'standard'}`,
        gameId: game._id || game.id,
        title: game.title,
        edition: selectedEdition.name || 'Стандартное издание',
        price: price,
        imageUrl: game.imageUrl,
      }));
      
      navigate('/cart');
    }
  };
  
  if (loading === 'pending') {
    return <div className="loading">Загрузка...</div>;
  }
  
  if (error || !game) {
    return <div className="error-message">Не удалось загрузить информацию об игре</div>;
  }
  
  const discountPercentage = game.discountPercentage 
    ? formatDiscount(game.discountPercentage) 
    : '';
  
  const price = selectedEdition?.discountPrice || selectedEdition?.originalPrice || game.discountPrice || game.originalPrice;
  
  return (
    <div className="game-page">
      {/* Header */}
      <div className="game-page__header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← 
        </button>
        <div className="game-page__title-section">
          <h1 className="game-page__title">{game.title}</h1>
        </div>
        <div className="game-page__action-placeholder"></div>
      </div>
      
      {/* Main content */}
      <div className="game-page__content">
        {/* Game cover image */}
        <div className="game-cover">
          <img 
            src={game.imageUrl} 
            alt={game.title} 
            className="game-cover__image" 
          />
          
          {discountPercentage && (
            <div className="game-cover__discount-badge">
              -{discountPercentage}%
            </div>
          )}
          
          <button className="game-cover__like-button">
            <span className="heart-icon">♡</span>
          </button>
        </div>
        
        {/* Price info */}
        <div className="game-price-info">
          <div className="game-price">
            <div className="game-price__amount">{price} ₽</div>
            {discountPercentage && (
              <div className="game-price__discount">-{discountPercentage}%</div>
            )}
          </div>
        </div>
        
        {/* Game editions */}
        {game.editions && game.editions.length > 1 && (
          <div className="game-editions">
            <h3 className="game-editions__title">Выберите издание:</h3>
            <div className="game-editions__list">
              {game.editions.map(edition => (
                <button
                  key={edition.id || edition.name}
                  className={`edition-button ${selectedEdition && (selectedEdition.id === edition.id || selectedEdition.name === edition.name) ? 'edition-button--selected' : ''}`}
                  onClick={() => setSelectedEdition(edition)}
                >
                  <div className="edition-name">{edition.name}</div>
                  <div className="edition-price">
                    {edition.discountPrice || edition.originalPrice} ₽
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="game-description">
          <h3 className="game-description__title">Описание</h3>
          
          <div className="game-important-info">
            <h3 className="game-important-info__title">Важно</h3>
            <ul className="game-important-info__list">
              <li>Игры остаются у вас навсегда.</li>
              <li>Можно удалять и скачивать игры заново.</li>
              <li>Играть можно в любое время.</li>
              <li>Можно играть по сети (при наличии PS Plus).</li>
              <li>Можно играть с друзьями</li>
              <li>Без вылетов и каких-либо проблем.</li>
              <li>Страна вашего основного аккаунта значения не имеет.</li>
              <li>Никаких ограничений со стороны Sony!</li>
            </ul>
          </div>
          
          <div className="game-platform-info">
            {game.platformSupport && (
              <div className="game-platform-item">
                <div className="game-platform-item__label">Платформа:</div>
                <div className="game-platform-item__value">{game.platformSupport}</div>
              </div>
            )}
            
            {game.voicePS5 && (
              <div className="game-platform-item">
                <div className="game-platform-item__label">Озвучка PS5:</div>
                <div className="game-platform-item__value">{game.voicePS5}</div>
              </div>
            )}
            
            {game.voicePS4 && (
              <div className="game-platform-item">
                <div className="game-platform-item__label">Озвучка PS4:</div>
                <div className="game-platform-item__value">{game.voicePS4}</div>
              </div>
            )}
            
            {game.subtitlesPS5 && (
              <div className="game-platform-item">
                <div className="game-platform-item__label">Субтитры PS5:</div>
                <div className="game-platform-item__value">{game.subtitlesPS5}</div>
              </div>
            )}
            
            {game.subtitlesPS4 && (
              <div className="game-platform-item">
                <div className="game-platform-item__label">Субтитры PS4:</div>
                <div className="game-platform-item__value">{game.subtitlesPS4}</div>
              </div>
            )}
          </div>
          
          {game.fullDescription && (
            <div className="game-full-description">
              <h3 className="game-full-description__title">Подробное описание</h3>
              <p className="game-full-description__text">{game.fullDescription}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Add to Cart button */}
      <div className="game-add-to-cart-fixed">
        <button className="game-add-to-cart-button" onClick={handleAddToCart}>
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default GamePage;