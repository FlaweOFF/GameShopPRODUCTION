import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './CategoriesList.css';

const CategoriesList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getCategories();
        
        // Проверяем, что данные получены в правильном формате
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.warn('Данные категорий не являются массивом:', response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        setError('Не удалось загрузить категории');
        setCategories([]); // Установить пустой массив при ошибке
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }
    
    try {
      await adminApiService.deleteCategory(id);
      // Обновляем список категорий после удаления
      setCategories(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(category => category._id !== id);
      });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      alert('Ошибка при удалении категории');
    }
  };
  
  // Фильтрация категорий на основе поискового запроса
  const filteredCategories = React.useMemo(() => {
    // Проверяем, что categories - это массив
    if (!Array.isArray(categories)) {
      console.warn('Categories не является массивом при фильтрации');
      return [];
    }
    
    if (!searchTerm) return categories;
    
    return categories.filter(category => {
      // Проверяем, что category.name существует и это строка
      const categoryName = typeof category.name === 'string' ? category.name.toLowerCase() : '';
      return categoryName.includes(searchTerm.toLowerCase());
    });
  }, [categories, searchTerm]);
  
  return (
    <div className="categories-list">
      <div className="list-header">
        <h1 className="list-header__title">Категории</h1>
        <Link to="/admin/categories/add" className="button button--primary">
          Добавить категорию
        </Link>
      </div>
      
      <div className="list-filters">
        <div className="list-filter">
          <label htmlFor="search" className="list-filter__label">Поиск:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Название категории..."
            className="list-filter__search"
          />
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
                <th>Название</th>
                <th>Слаг</th>
                <th>Описание</th>
                <th>Кол-во игр</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody className="list-table__body">
              {Array.isArray(filteredCategories) && filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.description || '—'}</td>
                    <td>{category.gamesCount || 0}</td>
                    <td>
                      <div className="list-table__actions">
                        <button
                          className="button button--small button--secondary"
                          onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="button button--small button--danger"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    Категории не найдены
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

export default CategoriesList;