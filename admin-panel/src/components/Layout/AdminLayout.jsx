import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await adminApiService.getProfile();
        setUser(response.data.data);
      } catch (error) {
        console.error('Ошибка получения профиля пользователя:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleLogout = () => {
    adminApiService.logout();
    navigate('/admin/login');
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/admin') return 'Панель управления';
    if (path === '/admin/games') return 'Игры';
    if (path === '/admin/games/add') return 'Добавление игры';
    if (path.includes('/admin/games/edit')) return 'Редактирование игры';
    if (path === '/admin/categories') return 'Категории';
    if (path === '/admin/categories/add') return 'Добавление категории';
    if (path.includes('/admin/categories/edit')) return 'Редактирование категории';
    if (path === '/admin/orders') return 'Заказы';
    if (path.includes('/admin/orders/')) return 'Детали заказа';
    if (path === '/admin/scraper') return 'Парсер игр';
    if (path === '/admin/settings') return 'Настройки магазина';
    
    return 'Админ панель';
  };
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="admin-sidebar__header">
          <h1 className="admin-sidebar__title">Game Store</h1>
        </div>
        
        <ul className="admin-sidebar__nav">
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">📊</span>
              Панель управления
            </NavLink>
          </li>
          
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin/games" 
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">🎮</span>
              Игры
            </NavLink>
          </li>
          
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin/categories" 
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">📂</span>
              Категории
            </NavLink>
          </li>
          
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">📦</span>
              Заказы
            </NavLink>
          </li>
          
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin/scraper" 
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">🔍</span>
              Парсер игр
            </NavLink>
          </li>
          
          <li className="admin-sidebar__nav-item">
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => 
                `admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`
              }
            >
              <span className="admin-sidebar__nav-icon">⚙️</span>
              Настройки магазина
            </NavLink>
          </li>
        </ul>
        
        <div className="admin-sidebar__footer">
          <small>© 2025 Game Store Admin</small>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="admin-content">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="admin-topbar__left">
            <button 
              className="admin-topbar__toggle"
              onClick={toggleSidebar}
            >
              ☰
            </button>
            <h2 className="admin-topbar__title">{getPageTitle()}</h2>
          </div>
          
          <div className="admin-topbar__right">
            <div className="admin-user">
              <span className="admin-user__name">
                {user?.name || user?.username || 'Admin'}
              </span>
              <button
                onClick={toggleUserMenu}
                className="admin-user__button"
              >
                ▼
              </button>
              
              <div className={`admin-user__menu ${userMenuOpen ? 'show' : ''}`}>
                <Link to="/admin/profile" className="admin-user__menu-item">
                  Профиль
                </Link>
                <button 
                  className="admin-user__menu-item"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;