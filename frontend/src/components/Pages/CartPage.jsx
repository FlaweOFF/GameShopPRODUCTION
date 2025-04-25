// src/components/Pages/CartPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../../store/cartSlice';
import { useTelegram } from '../../hooks/useTelegram';
import telegramService from '../../services/telegramService';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);
  const { mainButton, telegram, user } = useTelegram();
  
  useEffect(() => {
    if (items.length > 0) {
      mainButton.setText(`Оформить заказ (${total} ₽)`);
      mainButton.show();
      mainButton.onClick(handleCheckout);
    } else {
      mainButton.hide();
    }
    
    return () => {
      mainButton.offClick(handleCheckout);
    };
  }, [items, total]);
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };
  
  const handleCheckout = async () => {
    try {
      // Prepare order data
      const orderData = {
        items,
        total,
        userId: user?.id,
        username: user?.username,
        timestamp: new Date().toISOString()
      };
      
      // Send order to backend (via Telegram bot)
      const response = await telegramService.sendOrder(orderData);
      
      if (response.success) {
        // Show confirmation
        telegram.showPopup({
          title: 'Заказ оформлен',
          message: 'Ваш заказ успешно оформлен! Вы получите дальнейшие инструкции в сообщении от бота.',
          buttons: [{ type: 'ok' }]
        }, () => {
          // Clear cart and go back to home
          dispatch(clearCart());
          navigate('/');
        });
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      telegram.showPopup({
        title: 'Ошибка',
        message: 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.',
        buttons: [{ type: 'ok' }]
      });
    }
  };
  
  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h1 className="cart-page__title">Корзина</h1>
        <div className="cart-page__action-placeholder"></div>
      </div>
      
      <div className="cart-page__content">
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <div className="cart-empty__text">Ваша корзина пуста</div>
            <button 
              className="cart-empty__button"
              onClick={() => navigate('/')}
            >
              Перейти к магазину
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image-container">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="cart-item__image"
                    />
                  </div>
                  
                  <div className="cart-item__info">
                    <div className="cart-item__title">{item.title}</div>
                    <div className="cart-item__edition">{item.edition}</div>
                    <div className="cart-item__price">{item.price} ₽</div>
                  </div>
                  
                  <button 
                    className="cart-item__remove"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-summary__row">
                <div className="cart-summary__label">Товары ({items.length})</div>
                <div className="cart-summary__value">{total} ₽</div>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <div className="cart-summary__label">Итого</div>
                <div className="cart-summary__value">{total} ₽</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;