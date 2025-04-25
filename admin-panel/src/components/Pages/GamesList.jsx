import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './GamesList.css';

const GamesList = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGames, setSelectedGames] = useState([]);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'newest'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получение игр и категорий параллельно
        const [gamesResponse, categoriesResponse] = await Promise.all([
          adminApiService.getGames(),
          adminApiService.getCategories()
        ]);
        
        console.log('Ответ API для игр:', gamesResponse.data);
        console.log('Ответ API для категорий:', categoriesResponse.data);
        
        // Проверяем, что данные получены в правильном формате
        if (gamesResponse.data && gamesResponse.data.data && Array.isArray(gamesResponse.data.data)) {
          setGames(gamesResponse.data.data);
        } else {
          console.warn('Данные игр не являются массивом:', gamesResponse.data);
          setGames([]);
        }
        
        if (categoriesResponse.data && categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
          setCategories(categoriesResponse.data.data);
        } else {
          console.warn('Данные категорий не являются массивом:', categoriesResponse.data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные');
        setGames([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeleteGame = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту игру?')) {
      return;
    }
    
    try {
      await adminApiService.deleteGame(id);
      setGames(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(game => game._id !== id);
      });
    } catch (error) {
      console.error('Ошибка при удалении игры:', error);
      alert('Ошибка при удалении игры');
    }
  };
  
  // Обработка выбора игры (чекбокс)
  const handleGameSelect = (id) => {
    setSelectedGames(prev => {
      if (prev.includes(id)) {
        return prev.filter(gameId => gameId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Выбрать или отменить выбор всех игр
  const handleSelectAll = (selectAll) => {
    if (selectAll && Array.isArray(filteredGames)) {
      const allIds = filteredGames.map(game => game._id);
      setSelectedGames(allIds);
    } else {
      setSelectedGames([]);
    }
  };
  
  // Обновление цен и скидок выбранных игр
  const handleUpdatePrices = async () => {
    if (selectedGames.length === 0) {
      alert('Выберите игры для обновления цен');
      return;
    }
    
    if (!window.confirm(`Вы уверены, что хотите обновить цены для ${selectedGames.length} игр?`)) {
      return;
    }
    
    try {
      setUpdatingPrices(true);
      setUpdateMessage({
        type: 'info',
        text: 'Обновление цен...'
      });
      
      const response = await adminApiService.updateGamesPrices(selectedGames);
      
      // Обновляем локальный список игр, если получили обновленные данные
      if (response.data && response.data.data && response.data.data.updatedGames) {
        setGames(prevGames => {
          if (!Array.isArray(prevGames)) return [];
          
          const updatedGames = [...prevGames];
          response.data.data.updatedGames.forEach(updatedGame => {
            const index = updatedGames.findIndex(g => g._id === updatedGame._id);
            if (index !== -1) {
              updatedGames[index] = {
                ...updatedGames[index],
                originalPrice: updatedGame.originalPrice,
                discountPrice: updatedGame.discountPrice,
                discountPercentage: updatedGame.discountPercentage,
                discountEndDate: updatedGame.discountEndDate
              };
            }
          });
          
          return updatedGames;
        });
      }
      
      setSelectedGames([]);
      setUpdateMessage({
        type: 'success',
        text: `Успешно обновлены цены для ${response.data?.data?.successCount || 0} игр из ${selectedGames.length}`
      });
      
      // Скрываем сообщение через 5 секунд
      setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Ошибка при обновлении цен:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Ошибка при обновлении цен'
      });
    } finally {
      setUpdatingPrices(false);
    }
  };
  
  // Применение фильтров и сортировки к играм
  const filteredGames = React.useMemo(() => {
    console.log('Вычисление filteredGames, games=', games);
    
    // Проверяем, что games - это массив
    if (!Array.isArray(games)) {
      console.warn('Games не является массивом при фильтрации');
      return [];
    }
    
    try {
      return games.filter(game => {
        // Фильтр по категории
        if (filters.category && Array.isArray(game.categories) && !game.categories.includes(filters.category)) {
          return false;
        }
        
        // Фильтр по поисковому запросу
        if (filters.search && typeof game.title === 'string' && !game.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        
        return true;
      }).sort((a, b) => {
        // Сортировка игр
        switch (filters.sort) {
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'oldest':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'title_desc':
            return (b.title || '').localeCompare(a.title || '');
          case 'price_asc':
            return (a.originalPrice || 0) - (b.originalPrice || 0);
          case 'price_desc':
            return (b.originalPrice || 0) - (a.originalPrice || 0);
          default:
            return 0;
        }
      });
    } catch (error) {
      console.error('Ошибка при фильтрации игр:', error);
      return [];
    }
  }, [games, filters]);
  
  console.log('Отрисовка GamesList, filteredGames=', filteredGames);
  
  return (
    <div className="games-list">
      <div className="list-header">
        <h1 className="list-header__title">Игры</h1>
        <div className="list-header__actions">
          {selectedGames.length > 0 && (
            <button 
              className="button button--secondary"
              onClick={handleUpdatePrices}
              disabled={updatingPrices}
            >
              {updatingPrices ? 'Обновление...' : `Обновить цены (${selectedGames.length})`}
            </button>
          )}
          <Link to="/admin/games/add" className="button button--primary">
            Добавить игру
          </Link>
        </div>
      </div>
      
      {updateMessage && (
        <div className={`message message--${updateMessage.type}`}>
          {updateMessage.text}
        </div>
      )}
      
      <div className="list-filters">
        <div className="list-filter">
          <label htmlFor="search" className="list-filter__label">Поиск:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Название игры..."
            className="list-filter__search"
          />
        </div>
        
        <div className="list-filter">
          <label htmlFor="category" className="list-filter__label">Категория:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="list-filter__select"
          >
            <option value="">Все категории</option>
            {Array.isArray(categories) && categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="list-filter">
          <label htmlFor="sort" className="list-filter__label">Сортировка:</label>
          <select
            id="sort"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="list-filter__select"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="title_asc">По названию (А-Я)</option>
            <option value="title_desc">По названию (Я-А)</option>
            <option value="price_asc">По цене (возр.)</option>
            <option value="price_desc">По цене (убыв.)</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="list-table">
          <table className="list-table__table">
            <thead className="list-table__header">
              <tr>
                <th>
                  <input 
                    type="checkbox"
                    checked={Array.isArray(filteredGames) && filteredGames.length > 0 && selectedGames.length === filteredGames.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Изображение</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Категории</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody className="list-table__body">
              {Array.isArray(filteredGames) && filteredGames.length > 0 ? (
                filteredGames.map(game => (
                  <tr key={game._id}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedGames.includes(game._id)}
                        onChange={() => handleGameSelect(game._id)}
                      />
                    </td>
                    <td>
                      <div className="game-image">
                        <img src={game.imageUrl} alt={game.title} />
                      </div>
                    </td>
                    <td>{game.title}</td>
                    <td>
                      {game.discountPrice ? (
                        <>
                          <span className="original-price">{game.originalPrice} ₽</span>
                          <span className="discount-price">{game.discountPrice} ₽</span>
                        </>
                      ) : (
                        `${game.originalPrice} ₽`
                      )}
                    </td>
                    <td>
                      {Array.isArray(game.categories) && game.categories.map(catId => {
                        const category = Array.isArray(categories) && categories.find(c => c._id === catId);
                        return category ? (
                          <span key={catId} className="category-badge">
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </td>
                    <td>
                      {game.isFeatured && <span className="status-badge featured">Рекомендуемая</span>}
                      {game.isWeeklyDiscount && <span className="status-badge discount">Скидка недели</span>}
                      {game.isBestseller && <span className="status-badge bestseller">Бестселлер</span>}
                    </td>
                    <td>
                      <div className="list-table__actions">
                        <button
                          className="button button--small button--secondary"
                          onClick={() => navigate(`/admin/games/edit/${game._id}`)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="button button--small button--danger"
                          onClick={() => handleDeleteGame(game._id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    Игры не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GamesList;