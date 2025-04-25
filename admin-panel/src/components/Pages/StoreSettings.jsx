// admin-panel/src/components/Pages/StoreSettings.jsx
import React, { useState, useEffect } from 'react';
import adminApiService from '../../services/adminApiService';
import './StoreSettings.css';

const StoreSettings = () => {
  const [settings, setSettings] = useState({
    uahToRubRate: 2.5,
    defaultMarkup: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Состояние для калькулятора цен
  const [testUahPrice, setTestUahPrice] = useState('');
  const [testMarkup, setTestMarkup] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getSettings();
        
        if (response.data && response.data.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        setError('Не удалось загрузить настройки магазина');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await adminApiService.updateSettings(settings);
      
      setSuccessMessage('Настройки успешно сохранены');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      setError('Не удалось сохранить настройки магазина');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestCalculation = async () => {
    if (!testUahPrice) {
      alert('Введите цену в гривнах');
      return;
    }
    
    try {
      const response = await adminApiService.calculatePrice({
        uahPrice: parseFloat(testUahPrice),
        customMarkup: testMarkup ? parseFloat(testMarkup) : undefined
      });
      
      if (response.data && response.data.data) {
        setCalculationResult(response.data.data);
      }
    } catch (error) {
      console.error('Ошибка при тестовом расчете цены:', error);
      alert('Не удалось рассчитать цену');
    }
  };
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return (
    <div className="store-settings">
      <h1 className="store-settings__title">Настройки магазина</h1>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="uahToRubRate">Курс гривны к рублю</label>
          <input
            type="number"
            id="uahToRubRate"
            name="uahToRubRate"
            value={settings.uahToRubRate}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
          <small>Укажите, сколько рублей стоит 1 гривна</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="defaultMarkup">Стандартная наценка (%)</label>
          <input
            type="number"
            id="defaultMarkup"
            name="defaultMarkup"
            value={settings.defaultMarkup}
            onChange={handleChange}
            step="1"
            min="0"
            required
          />
          <small>Укажите наценку в процентах (например, 50 для 50%)</small>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button button--primary"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
      
      <div className="price-calculator">
        <h2 className="price-calculator__title">Калькулятор цен</h2>
        <div className="calculator-form">
          <div className="form-row">
            <div className="form-group form-group--half">
              <label htmlFor="testUahPrice">Цена в гривнах</label>
              <input 
                type="number" 
                id="testUahPrice" 
                value={testUahPrice}
                onChange={(e) => setTestUahPrice(e.target.value)}
                min="0" 
                step="0.01" 
              />
            </div>
            
            <div className="form-group form-group--half">
              <label htmlFor="testMarkup">Индивидуальная наценка (%)</label>
              <input 
                type="number" 
                id="testMarkup" 
                value={testMarkup}
                onChange={(e) => setTestMarkup(e.target.value)}
                min="0" 
              />
              <small>Оставьте пустым для использования стандартной наценки ({settings.defaultMarkup}%)</small>
            </div>
          </div>
          
          <button 
            type="button" 
            className="button button--secondary" 
            onClick={handleTestCalculation}
          >
            Рассчитать цену
          </button>
          
          {calculationResult && (
            <div className="calculation-result">
              <h3>Результат расчета:</h3>
              <ul className="result-list">
                <li><strong>Цена в гривнах:</strong> {calculationResult.uahPrice} UAH</li>
                <li><strong>Курс обмена:</strong> {calculationResult.rubExchangeRate} RUB/UAH</li>
                <li><strong>Себестоимость:</strong> {calculationResult.costPrice} RUB</li>
                <li><strong>Наценка:</strong> {calculationResult.markup}%</li>
                <li><strong>Итоговая цена:</strong> {calculationResult.finalPrice} RUB</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;