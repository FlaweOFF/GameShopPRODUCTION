import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './CategoryForm.css';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await adminApiService.getCategory(id);
          setCategory(response.data);
        } catch (error) {
          console.error('Error fetching category:', error);
          setError('Не удалось загрузить данные категории');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCategory();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setCategory(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setCategory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setCategory(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with -
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (id) {
        // Update existing category
        await adminApiService.updateCategory(id, category);
      } else {
        // Create new category
        await adminApiService.createCategory(category);
      }
      
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Ошибка при сохранении категории');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (
    <div className="category-form">
      <h1 className="category-form__title">
        {id ? `Редактирование: ${category.name}` : 'Добавление новой категории'}
      </h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название</label>
          <input
            type="text"
            id="name"
            name="name"
            value={category.name}
            onChange={handleNameChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="slug">Слаг (URL)</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={category.slug}
            onChange={handleChange}
            required
          />
          <small>URL-сегмент для категории (только латинские буквы, цифры и дефисы)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={category.description}
            onChange={handleChange}
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-group form-group--checkbox">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={category.isActive}
              onChange={handleChange}
            />
            Активная категория
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="button button--secondary"
            onClick={() => navigate('/admin/categories')}
          >
            Отмена
          </button>
          
          <button 
            type="submit" 
            className="button button--primary"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : (id ? 'Обновить категорию' : 'Добавить категорию')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;