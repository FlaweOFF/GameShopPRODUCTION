import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalCategories: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Панель управления</h1>
      
      {loading ? (
        <div className="dashboard__loading">Загрузка...</div>
      ) : (
        <>
          <div className="dashboard__stats">
            <div className="stat-card">
              <div className="stat-card__icon">🎮</div>
              <div className="stat-card__value">{stats.totalGames}</div>
              <div className="stat-card__label">Игры</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card__icon">📂</div>
              <div className="stat-card__value">{stats.totalCategories}</div>
              <div className="stat-card__label">Категории</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card__icon">⏳</div>
              <div className="stat-card__value">{stats.pendingOrders}</div>
              <div className="stat-card__label">Ожидают</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__value">{stats.completedOrders}</div>
              <div className="stat-card__label">Выполнены</div>
            </div>
          </div>
          
          <div className="dashboard__actions">
            <div className="action-card" onClick={() => navigate('/admin/games')}>
              <div className="action-card__icon">🎮</div>
              <div className="action-card__title">Управление играми</div>
              <div className="action-card__description">
                Добавление, редактирование и удаление игр
              </div>
            </div>
            
            <div className="action-card" onClick={() => navigate('/admin/categories')}>
              <div className="action-card__icon">📂</div>
              <div className="action-card__title">Управление категориями</div>
              <div className="action-card__description">
                Добавление, редактирование и удаление категорий
              </div>
            </div>
            
            <div className="action-card" onClick={() => navigate('/admin/orders')}>
              <div className="action-card__icon">📦</div>
              <div className="action-card__title">Заказы</div>
              <div className="action-card__description">
                Просмотр и управление заказами
              </div>
            </div>
            
            <div className="action-card" onClick={() => navigate('/admin/scraper')}>
              <div className="action-card__icon">🔍</div>
              <div className="action-card__title">Парсер игр</div>
              <div className="action-card__description">
                Парсинг данных игр с PlayStation Store
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;