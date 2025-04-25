import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './GameScraper.css';

const GameScraper = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [error, setError] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  
  // Fetch categories when component mounts
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getCategories();
        // Make sure categories is always an array
        if (Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.warn('Categories data is not an array:', response.data);
          setCategories([]); // Set to empty array if not an array
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setCategories([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSingleScrape = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await adminApiService.scrapeGame({
        url,
        categoryId: categoryId || undefined
      });
      
      setResult(response.data.data);
    } catch (error) {
      console.error('Error scraping game:', error);
      setError(error.response?.data?.error || 'Failed to scrape game data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkScrape = async (e) => {
    e.preventDefault();
    
    if (!urls) {
      setBulkError('Please enter URLs');
      return;
    }
    
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length === 0) {
      setBulkError('Please enter at least one valid URL');
      return;
    }
    
    try {
      setBulkLoading(true);
      setBulkError(null);
      setBulkResult(null);
      
      const response = await adminApiService.bulkScrapeGames({
        urls: urlList,
        categoryId: categoryId || undefined
      });
      
      setBulkResult(response.data.data);
    } catch (error) {
      console.error('Error bulk scraping games:', error);
      setBulkError(error.response?.data?.error || 'Failed to scrape games data');
    } finally {
      setBulkLoading(false);
    }
  };
  
  // Функция для массового обновления цен для всех игр
  const handleUpdateAllPrices = async () => {
    if (!window.confirm('Вы уверены, что хотите обновить цены для всех игр? Это может занять некоторое время.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const gamesResponse = await adminApiService.getGames();
      const allGameIds = gamesResponse.data.data.map(game => game._id);
      
      const response = await adminApiService.updateGamesPrices(allGameIds);
      
      alert(`Цены успешно обновлены для ${response.data.data.successCount} из ${allGameIds.length} игр.`);
    } catch (error) {
      console.error('Error updating all prices:', error);
      setError('Ошибка при обновлении цен игр');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="game-scraper">
      <h1 className="game-scraper__title">Парсер игр</h1>
      
      <div className="scraper-section">
        <h2 className="scraper-section__title">Обновление цен</h2>
        <p className="scraper-section__description">
          Нажмите кнопку ниже, чтобы обновить цены и скидки для всех игр.
          Система обратится к источнику данных и обновит актуальные цены.
        </p>
        
        <button 
          className="button button--primary"
          onClick={handleUpdateAllPrices}
          disabled={loading}
        >
          {loading ? 'Обновление...' : 'Обновить цены всех игр'}
        </button>
      </div>
      
      <div className="scraper-section">
        <h2 className="scraper-section__title">Категория для новых игр</h2>
        
        <div className="form-group">
          <label htmlFor="categoryId">Категория (опционально)</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">-- Без категории --</option>
            {/* Make sure categories exists and is iterable before attempting to map */}
            {Array.isArray(categories) && categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="scraper-sections">
        <div className="scraper-section">
          <h2 className="scraper-section__title">Одиночный парсинг</h2>
          
          <form onSubmit={handleSingleScrape}>
            <div className="form-group">
              <label htmlFor="url">URL игры на PlayStation Store</label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://store.playstation.com/ru-ua/product/..."
                disabled={loading}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="button button--primary"
              disabled={loading}
            >
              {loading ? 'Парсинг...' : 'Получить данные игры'}
            </button>
          </form>
          
          {result && (
            <div className="scrape-result">
              <h3 className="scrape-result__title">Результат:</h3>
              
              <div className="game-preview">
                <div className="game-preview__image">
                  <img src={result.imageUrl} alt={result.title} />
                </div>
                
                <div className="game-preview__details">
                  <h4>{result.title}</h4>
                  <p><strong>Цена:</strong> {result.originalPrice} ₽</p>
                  {result.discountPrice && (
                    <p><strong>Цена со скидкой:</strong> {result.discountPrice} ₽</p>
                  )}
                  {result.genres && result.genres.length > 0 && (
                    <p><strong>Жанры:</strong> {result.genres.join(', ')}</p>
                  )}
                </div>
              </div>
              
              <div className="scrape-actions">
                <button 
                  className="button button--secondary"
                  onClick={() => navigate(`/admin/games/edit/${result._id}`)}
                >
                  Редактировать игру
                </button>
                
                <button 
                  className="button button--primary"
                  onClick={() => navigate('/admin/games')}
                >
                  К списку игр
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="scraper-section">
          <h2 className="scraper-section__title">Массовый парсинг</h2>
          
          <form onSubmit={handleBulkScrape}>
            <div className="form-group">
              <label htmlFor="urls">URLs игр (по одному на строку)</label>
              <textarea
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://store.playstation.com/ru-ua/product/...&#10;https://store.playstation.com/ru-ua/product/..."
                rows="5"
                disabled={bulkLoading}
              ></textarea>
            </div>
            
            {bulkError && <div className="error-message">{bulkError}</div>}
            
            <button 
              type="submit" 
              className="button button--primary"
              disabled={bulkLoading}
            >
              {bulkLoading ? 'Парсинг...' : 'Получить данные игр'}
            </button>
          </form>
          
          {bulkResult && (
            <div className="scrape-result">
              <h3 className="scrape-result__title">Результаты:</h3>
              
              <div className="bulk-result">
                <div className="bulk-result__stats">
                  <div className="stat-item">
                    <div className="stat-item__label">Всего обработано:</div>
                    <div className="stat-item__value">{bulkResult.totalProcessed}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-item__label">Успешно:</div>
                    <div className="stat-item__value">{bulkResult.successCount}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-item__label">С ошибками:</div>
                    <div className="stat-item__value">{bulkResult.failedCount}</div>
                  </div>
                </div>
                
                {bulkResult.results && bulkResult.results.success && bulkResult.results.success.length > 0 && (
                  <div className="bulk-result__section">
                    <h4 className="bulk-result__section-title">Успешно обработанные игры:</h4>
                    <ul className="bulk-result__list">
                      {bulkResult.results.success.map((game, index) => (
                        <li key={index} className="bulk-result__item">
                          <span className="bulk-result__item-title">{game.title}</span>
                          <button 
                            className="button button--small"
                            onClick={() => navigate(`/admin/games/edit/${game.gameId}`)}
                          >
                            Редактировать
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {bulkResult.results && bulkResult.results.failed && bulkResult.results.failed.length > 0 && (
                  <div className="bulk-result__section">
                    <h4 className="bulk-result__section-title">Ошибки обработки:</h4>
                    <ul className="bulk-result__list bulk-result__list--errors">
                      {bulkResult.results.failed.map((item, index) => (
                        <li key={index} className="bulk-result__item">
                          <div className="bulk-result__item-url">{item.url}</div>
                          <div className="bulk-result__item-error">{item.error}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="scrape-actions">
                  <button 
                    className="button button--primary"
                    onClick={() => navigate('/admin/games')}
                  >
                    К списку игр
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScraper;