import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './OrdersList.css';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sort: 'newest'
  });
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getOrders();
        
        // Проверяем, что получены данные в правильном формате
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
        } else {
          console.warn('Данные заказов не являются массивом:', response.data);
          setOrders([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        setError('Не удалось загрузить заказы');
        setOrders([]); // Установить пустой массив при ошибке
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Ожидает обработки';
      case 'processing':
        return 'В обработке';
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'processing':
        return 'status-badge processing';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };
  
  // Форматирование даты в формате DD.MM.YYYY
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Ошибка форматирования даты:', e);
      return dateString || '';
    }
  };
  
  // Применение фильтров и сортировки к заказам
  const filteredOrders = React.useMemo(() => {
    // Проверяем, что orders - это массив
    if (!Array.isArray(orders)) {
      console.warn('Orders не является массивом при фильтрации');
      return [];
    }
    
    return orders.filter(order => {
      // Фильтр по статусу
      if (filters.status && order.status !== filters.status) {
        return false;
      }
      
      // Фильтр по поиску (ID заказа или email клиента)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const orderId = String(order._id || '').toLowerCase();
        const customerEmail = String(order.customerEmail || '').toLowerCase();
        
        return (
          orderId.includes(searchTerm) ||
          customerEmail.includes(searchTerm)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Сортировка заказов
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'total_high':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'total_low':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });
  }, [orders, filters]);
  
  return (
    <div className="orders-list">
      <div className="list-header">
        <h1 className="list-header__title">Заказы</h1>
      </div>
      
      <div className="list-filters">
        <div className="list-filter">
          <label htmlFor="search" className="list-filter__label">Поиск:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="ID заказа или Email..."
            className="list-filter__search"
          />
        </div>
        
        <div className="list-filter">
          <label htmlFor="status" className="list-filter__label">Статус:</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="list-filter__select"
          >
            <option value="">Все статусы</option>
            <option value="pending">Ожидает обработки</option>
            <option value="processing">В обработке</option>
            <option value="completed">Выполнен</option>
            <option value="cancelled">Отменен</option>
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
            <option value="total_high">По сумме (убыв.)</option>
            <option value="total_low">По сумме (возр.)</option>
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
                <th>ID заказа</th>
                <th>Дата</th>
                <th>Покупатель</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody className="list-table__body">
              {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.customerEmail || 'Н/Д'}</td>
                    <td>{order.totalAmount || order.total || 0} ₽</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="list-table__actions">
                        <button
                          className="button button--small button--secondary"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          Детали
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    Заказы не найдены
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

export default OrdersList;