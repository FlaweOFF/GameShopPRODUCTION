import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await adminApiService.login(credentials);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Ошибка входа. Проверьте имя пользователя и пароль.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-form">
        <div className="login-form__header">
          <h1 className="login-form__title">Game Store Admin</h1>
          <p className="login-form__subtitle">Вход в административную панель</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="button button--primary login-form__submit"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;