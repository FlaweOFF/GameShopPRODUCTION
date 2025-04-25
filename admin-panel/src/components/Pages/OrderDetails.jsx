import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApiService from '../../services/adminApiService';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getOrder(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Не удалось загрузить данные заказа');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await adminApiService.updateOrderStatus(id, newStatus);
      
      // Update local order state
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setUpdatingStatus(false);
    }
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
  
  // Format date in DD.MM.YYYY HH:MM format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!order) {
    return <div className="error-message">Заказ не найден</div>;
  }
  
  return (
    <div className="order-details">
      <div className="order-details__header">
        <div>
          <h1 className="order-details__title">Заказ #{order._id}</h1>
          <p className="order-details__date">от {formatDate(order.createdAt)}</p>
        </div>
        <button 
          className="button button--secondary"
          onClick={() => navigate('/admin/orders')}
        >
          Назад к списку
        </button>
      </div>
      
      <div className="order-details__status-bar">
        <div className="order-details__current-status">
          <span className="status-label">Текущий статус:</span>
          <span className={getStatusClass(order.status)}>
            {getStatusLabel(order.status)}
          </span>
        </div>
        
        <div className="order-details__status-actions">
          <span className="status-label">Изменить статус:</span>
          <div className="status-buttons">
            <button
              className="button button--small"
              onClick={() => handleStatusChange('pending')}
              disabled={order.status === 'pending' || updatingStatus}
            >
              Ожидает
            </button>
            <button
              className="button button--small"
              onClick={() => handleStatusChange('processing')}
              disabled={order.status === 'processing' || updatingStatus}
            >
              В обработке
            </button>
            <button
              className="button button--small button--success"
              onClick={() => handleStatusChange('completed')}
              disabled={order.status === 'completed' || updatingStatus}
            >
              Выполнен
            </button>
            <button
              className="button button--small button--danger"
              onClick={() => handleStatusChange('cancelled')}
              disabled={order.status === 'cancelled' || updatingStatus}
            >
              Отменен
            </button>
          </div>
        </div>
      </div>
      
      <div className="order-details__sections">
        <div className="order-section">
          <h2 className="order-section__title">Информация о покупателе</h2>
          <div className="order-section__content">
            <div className="info-item">
              <div className="info-item__label">Email:</div>
              <div className="info-item__value">{order.customerEmail}</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Telegram ID:</div>
              <div className="info-item__value">{order.telegramId || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Имя пользователя:</div>
              <div className="info-item__value">{order.username || '—'}</div>
            </div>
          </div>
        </div>
        
        <div className="order-section">
          <h2 className="order-section__title">Детали заказа</h2>
          <div className="order-section__content">
            <div className="info-item">
              <div className="info-item__label">Общая сумма:</div>
              <div className="info-item__value info-item__value--highlight">{order.totalAmount} ₽</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Способ оплаты:</div>
              <div className="info-item__value">{order.paymentMethod || 'Telegram Payments'}</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">ID платежа:</div>
              <div className="info-item__value">{order.paymentId || '—'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="order-section">
        <h2 className="order-section__title">Позиции заказа</h2>
        <div className="order-section__content">
          <div className="order-items">
            <table className="order-items__table">
              <thead>
                <tr>
                  <th>Игра</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="order-item">
                        {item.imageUrl && (
                          <div className="order-item__image">
                            <img src={item.imageUrl} alt={item.title} />
                          </div>
                        )}
                        <div className="order-item__details">
                          <div className="order-item__title">{item.title}</div>
                          {item.platform && (
                            <div className="order-item__platform">{item.platform}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="order-item__price">{item.price} ₽</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Итого:</td>
                  <td className="order-total">{order.totalAmount} ₽</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      {order.notes && (
        <div className="order-section">
          <h2 className="order-section__title">Примечания</h2>
          <div className="order-section__content">
            <div className="order-notes">
              {order.notes}
            </div>
          </div>
        </div>
      )}
      
      <div className="order-details__actions">
        <button 
          className="button button--secondary"
          onClick={() => navigate('/admin/orders')}
        >
          Назад к списку
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;