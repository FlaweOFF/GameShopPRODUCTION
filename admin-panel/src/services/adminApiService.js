// admin-panel/src/services/adminApiService.js
import axios from 'axios';

// Define API URL with environment variable fallback
// Make sure this points to your actual backend server
const API_URL = process.env.REACT_APP_API_URL || '/api';
const ADMIN_API = `${API_URL}/admin`;

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: ADMIN_API,
  headers: {
    'Content-Type': 'application/json'
  },
  // Important: Add these options to help with CORS
  withCredentials: false,
  timeout: 10000
});

// Обработчик ответа для гарантии возврата массива для списков
const ensureArrayResponse = (response) => {
  if (!response || !response.data) {
    console.warn('Пустой ответ API');
    return { data: { data: [] } };
  }

  // Если data.data отсутствует, создаем пустой массив
  if (!response.data.data) {
    console.warn('Ответ API не содержит поля data.data');
    response.data.data = [];
  }

  // Если data.data не является массивом, преобразуем в массив
  if (!Array.isArray(response.data.data)) {
    console.warn('Поле data.data не является массивом, преобразуем');
    if (response.data.data) {
      // Если это объект, помещаем его в массив
      response.data.data = [response.data.data];
    } else {
      // Если это null/undefined, создаем пустой массив
      response.data.data = [];
    }
  }

  return response;
};

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Запрос API:', config.method, config.url);
    return config;
  },
  (error) => {
    console.error('Ошибка запроса:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`Успешный ответ API: ${response.config.method} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', error.response || error);
    
    if (error.response && error.response.status === 401) {
      console.log('Ошибка аутентификации, перенаправление на страницу входа');
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const adminApiService = {
  // Auth
  login: async (credentials) => {
    console.log('Попытка входа с:', credentials.username);
    try {
      const response = await axios.post(`${ADMIN_API}/login`, credentials);
      
      // Save token to localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        console.log('Токен авторизации сохранен');
      } else {
        console.warn('Получен ответ без токена');
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка входа:', error.response || error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
  },
  
  // Profile
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response;
    } catch (error) {
      console.error('Ошибка получения профиля:', error.response || error);
      throw error;
    }
  },
  
  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard');
      return response;
    } catch (error) {
      console.error('Ошибка получения статистики дашборда:', error.response || error);
      throw error;
    }
  },
  
  // Games
  getGames: async () => {
    try {
      const response = await api.get('/games');
      return ensureArrayResponse(response);
    } catch (error) {
      console.error('Ошибка получения игр:', error.response || error);
      return { data: { data: [] } }; // Возвращаем пустой массив в случае ошибки
    }
  },
  
  getGame: async (id) => {
    try {
      const response = await api.get(`/games/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка получения игры ${id}:`, error.response || error);
      throw error;
    }
  },
  
  createGame: async (gameData) => {
    try {
      const response = await api.post('/games', gameData);
      return response;
    } catch (error) {
      console.error('Ошибка создания игры:', error.response || error);
      throw error;
    }
  },
  
  updateGame: async (id, gameData) => {
    try {
      const response = await api.put(`/games/${id}`, gameData);
      return response;
    } catch (error) {
      console.error(`Ошибка обновления игры ${id}:`, error.response || error);
      throw error;
    }
  },
  
  deleteGame: async (id) => {
    try {
      const response = await api.delete(`/games/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка удаления игры ${id}:`, error.response || error);
      throw error;
    }
  },
  
  // Categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return ensureArrayResponse(response);
    } catch (error) {
      console.error('Ошибка получения категорий:', error.response || error);
      return { data: { data: [] } }; // Возвращаем пустой массив в случае ошибки
    }
  },
  
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка получения категории ${id}:`, error.response || error);
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Ошибка создания категории:', error.response || error);
      throw error;
    }
  },
  
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error(`Ошибка обновления категории ${id}:`, error.response || error);
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка удаления категории ${id}:`, error.response || error);
      throw error;
    }
  },
  
  // Orders
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return ensureArrayResponse(response);
    } catch (error) {
      console.error('Ошибка получения заказов:', error.response || error);
      return { data: { data: [] } }; // Возвращаем пустой массив в случае ошибки
    }
  },
  
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error(`Ошибка получения заказа ${id}:`, error.response || error);
      throw error;
    }
  },
  
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}`, { status });
      return response;
    } catch (error) {
      console.error(`Ошибка обновления статуса заказа ${id}:`, error.response || error);
      throw error;
    }
  },
  
  // Game Scraper
  scrapeGame: async (data) => {
    try {
      const response = await api.post('/scrape-game', data);
      return response;
    } catch (error) {
      console.error('Ошибка парсинга игры:', error.response || error);
      throw error;
    }
  },
  
  bulkScrapeGames: async (data) => {
    try {
      const response = await api.post('/bulk-scrape', data);
      return response;
    } catch (error) {
      console.error('Ошибка массового парсинга игр:', error.response || error);
      throw error;
    }
  },
  
  // Update game prices
  updateGamesPrices: async (gameIds) => {
    try {
      const response = await api.post('/update-prices', { gameIds });
      return response;
    } catch (error) {
      console.error('Ошибка обновления цен игр:', error.response || error);
      throw error;
    }
  },
  
  // Store settings
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response;
    } catch (error) {
      console.error('Ошибка получения настроек:', error.response || error);
      throw error;
    }
  },
  
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/settings', settingsData);
      return response;
    } catch (error) {
      console.error('Ошибка обновления настроек:', error.response || error);
      throw error;
    }
  },
  
  calculatePrice: async (data) => {
    try {
      const response = await api.post('/calculate-price', data);
      return response;
    } catch (error) {
      console.error('Ошибка расчета цены:', error.response || error);
      throw error;
    }
  }
};

export default adminApiService;