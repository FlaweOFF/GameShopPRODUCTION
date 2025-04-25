import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './GameForm.css';

const GameForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Инициализируем все поля с безопасными значениями по умолчанию
  const [game, setGame] = useState({
    title: '',
    imageUrl: '',
    backgroundImageUrl: '',
    originalPrice: 0,
    discountPrice: null,
    discountPercentage: '',
    discountEndDate: '',
    fullDescription: '',
    shortDescription: '',
    genres: [], // Инициализируем как пустой массив
    releaseDate: '',
    releaseYear: '',
    platformSupport: '',
    isFeatured: false,
    isWeeklyDiscount: false,
    isBestseller: false,
    categories: []
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uahPrice, setUahPrice] = useState('');
  const [customMarkup, setCustomMarkup] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Всегда начинаем с пустого массива категорий для безопасности
        setCategories([]);
        
        const categoriesResponse = await adminApiService.getCategories();
        console.log('Ответ API для категорий:', categoriesResponse);
        
        // Проверяем, что данные категорий правильного формата
        if (
          categoriesResponse && 
          categoriesResponse.data && 
          categoriesResponse.data.data && 
          Array.isArray(categoriesResponse.data.data)
        ) {
          setCategories(categoriesResponse.data.data);
        } else {
          console.warn('Данные категорий не являются массивом:', categoriesResponse);
          // Устанавливаем пустой массив если данные неверного формата
          setCategories([]);
        }
        
        // Если есть ID, загружаем данные игры
        if (id) {
          setLoading(true);
          
          try {
            const gameResponse = await adminApiService.getGame(id);
            console.log('Ответ API для игры:', gameResponse);
            
            // Проверяем, что данные игры правильного формата
            if (gameResponse && gameResponse.data && gameResponse.data.data) {
              // Создаем безопасную копию данных игры
              const gameData = { ...gameResponse.data.data };
              
              // Убедимся, что все поля массивов инициализированы
              gameData.genres = Array.isArray(gameData.genres) ? gameData.genres : [];
              gameData.categories = Array.isArray(gameData.categories) ? gameData.categories : [];
              
              // Убедимся, что все значения имеют корректные типы
              gameData.originalPrice = gameData.originalPrice || 0;
              gameData.isFeatured = Boolean(gameData.isFeatured);
              gameData.isWeeklyDiscount = Boolean(gameData.isWeeklyDiscount);
              gameData.isBestseller = Boolean(gameData.isBestseller);
              
              setGame(gameData);
            } else {
              console.error('Неверный формат данных игры:', gameResponse);
              setError('Неверный формат данных игры');
            }
          } catch (gameError) {
            console.error('Ошибка при загрузке игры:', gameError);
            setError('Не удалось загрузить данные игры');
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        setError('Не удалось загрузить категории');
        // Гарантируем, что категории всегда массив
        setCategories([]);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Создаем безопасный массив категорий для использования в JSX
  const safeCategoriesArray = React.useMemo(() => {
    // Проверяем, что categories действительно массив
    if (!Array.isArray(categories)) {
      console.warn('categories не является массивом в GameForm');
      return [];
    }
    return categories;
  }, [categories]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setGame(prevGame => ({
        ...prevGame,
        [name]: checked
      }));
    } else if (name === 'genres') {
      // Handle genres as comma-separated values
      const genresArray = value ? value.split(',').map(genre => genre.trim()) : [];
      setGame(prevGame => ({
        ...prevGame,
        genres: genresArray
      }));
    } else if (name === 'categories') {
      // Handle multiple select for categories
      const selectedCategories = Array.from(e.target.selectedOptions, option => option.value);
      setGame(prevGame => ({
        ...prevGame,
        categories: selectedCategories
      }));
    } else {
      setGame(prevGame => ({
        ...prevGame,
        [name]: value
      }));
    }
  };
  
  // Безопасное отображение строки из массива
  const safeJoin = (arr, separator = ', ') => {
    if (Array.isArray(arr)) {
      return arr.join(separator);
    }
    return '';
  };
  
  const calculatePrice = async () => {
    if (!uahPrice) {
      alert('Введите цену в гривнах');
      return;
    }
    
    try {
      const response = await adminApiService.calculatePrice({
        uahPrice: parseFloat(uahPrice),
        customMarkup: customMarkup ? parseFloat(customMarkup) : undefined
      });
      
      if (response.data && response.data.data) {
        const priceData = response.data.data;
        
        // Обновляем поля игры с рассчитанной ценой
        setGame(prev => ({
          ...prev,
          originalPrice: priceData.finalPrice
        }));
        
        // Информируем пользователя
        alert(`
          Расчет выполнен:
          Цена в гривнах: ${priceData.uahPrice} UAH
          Курс обмена: ${priceData.rubExchangeRate} RUB/UAH
          Себестоимость: ${priceData.costPrice} RUB
          Наценка: ${priceData.markup}%
          Итоговая цена: ${priceData.finalPrice} RUB
        `);
      }
    } catch (error) {
      console.error('Ошибка при расчете цены:', error);
      alert('Не удалось рассчитать цену');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Проверяем, что у game есть все необходимые поля
      const gameData = {
        ...game,
        // Убедимся, что genres всегда массив
        genres: Array.isArray(game.genres) ? game.genres : [],
        // Убедимся, что categories всегда массив
        categories: Array.isArray(game.categories) ? game.categories : []
      };
      
      if (id) {
        // Update existing game
        await adminApiService.updateGame(id, gameData);
      } else {
        // Create new game
        await adminApiService.createGame(gameData);
      }
      
      navigate('/admin/games');
    } catch (error) {
      console.error('Ошибка при сохранении игры:', error);
      setError('Ошибка при сохранении игры');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (
    <div className="game-form">
      <h1 className="game-form__title">
        {id ? `Редактирование: ${game.title}` : 'Добавление новой игры'}
      </h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название</label>
          <input
            type="text"
            id="title"
            name="title"
            value={game.title || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">URL изображения</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={game.imageUrl || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="backgroundImageUrl">URL фонового изображения</label>
          <input
            type="text"
            id="backgroundImageUrl"
            name="backgroundImageUrl"
            value={game.backgroundImageUrl || ''}
            onChange={handleChange}
          />
        </div>
        
        {/* Калькулятор цены */}
        <div className="form-section">
          <h3 className="form-section__title">Калькулятор цены</h3>
          <div className="form-row">
            <div className="form-group form-group--half">
              <label htmlFor="uahPrice">Цена в гривнах (UAH)</label>
              <input
                type="number"
                id="uahPrice"
                value={uahPrice}
                onChange={(e) => setUahPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group form-group--half">
              <label htmlFor="customMarkup">Индивидуальная наценка (%)</label>
              <input
                type="number"
                id="customMarkup"
                value={customMarkup}
                onChange={(e) => setCustomMarkup(e.target.value)}
                min="0"
              />
              <small>Оставьте пустым для использования стандартной наценки</small>
            </div>
          </div>

          <button 
            type="button" 
            className="button button--secondary"
            onClick={calculatePrice}
          >
            Рассчитать цену в рублях
          </button>
        </div>
        
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="originalPrice">Оригинальная цена</label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={game.originalPrice || 0}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group form-group--half">
            <label htmlFor="discountPrice">Цена со скидкой</label>
            <input
              type="number"
              id="discountPrice"
              name="discountPrice"
              value={game.discountPrice || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="discountPercentage">Процент скидки</label>
            <input
              type="text"
              id="discountPercentage"
              name="discountPercentage"
              value={game.discountPercentage || ''}
              onChange={handleChange}
              placeholder="-20%"
            />
          </div>
          
          <div className="form-group form-group--half">
            <label htmlFor="discountEndDate">Дата окончания скидки</label>
            <input
              type="text"
              id="discountEndDate"
              name="discountEndDate"
              value={game.discountEndDate || ''}
              onChange={handleChange}
              placeholder="DD.MM.YYYY HH:mm GMT+3"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="fullDescription">Полное описание</label>
          <textarea
            id="fullDescription"
            name="fullDescription"
            value={game.fullDescription || ''}
            onChange={handleChange}
            required
            rows="6"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="shortDescription">Краткое описание</label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            value={game.shortDescription || ''}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="genres">Жанры (через запятую)</label>
          <input
            type="text"
            id="genres"
            name="genres"
            value={safeJoin(game.genres)}
            onChange={handleChange}
            placeholder="Action, Adventure, RPG"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="releaseDate">Дата выпуска</label>
            <input
              type="text"
              id="releaseDate"
              name="releaseDate"
              value={game.releaseDate || ''}
              onChange={handleChange}
              placeholder="DD.MM.YYYY"
            />
          </div>
          
          <div className="form-group form-group--half">
            <label htmlFor="releaseYear">Год выпуска</label>
            <input
              type="text"
              id="releaseYear"
              name="releaseYear"
              value={game.releaseYear || ''}
              onChange={handleChange}
              placeholder="YYYY"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="platformSupport">Поддерживаемые платформы</label>
          <input
            type="text"
            id="platformSupport"
            name="platformSupport"
            value={game.platformSupport || ''}
            onChange={handleChange}
            placeholder="PS4, PS5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="categories">Категории</label>
          <select
            id="categories"
            name="categories"
            multiple
            value={Array.isArray(game.categories) ? game.categories : []}
            onChange={handleChange}
          >
            {safeCategoriesArray.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <small>Удерживайте Ctrl (или Command на Mac) для выбора нескольких категорий</small>
        </div>
        
        <div className="form-row form-row--checkboxes">
          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={game.isFeatured || false}
                onChange={handleChange}
              />
              Рекомендуемая игра
            </label>
          </div>
          
          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                name="isWeeklyDiscount"
                checked={game.isWeeklyDiscount || false}
                onChange={handleChange}
              />
              Скидка недели
            </label>
          </div>
          
          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                name="isBestseller"
                checked={game.isBestseller || false}
                onChange={handleChange}
              />
              Бестселлер
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="button button--secondary"
            onClick={() => navigate('/admin/games')}
          >
            Отмена
          </button>
          
          <button 
            type="submit" 
            className="button button--primary"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : (id ? 'Обновить игру' : 'Добавить игру')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;