// src/hooks/useTelegram.js
import { useEffect, useState } from 'react';

export function useTelegram() {
  const [telegram, setTelegram] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setTelegram(tg);
      setUser(tg.initDataUnsafe?.user);
      
      tg.ready();
      setReady(true);
      
      // Set viewport height
      tg.expand();
      
      // Set theme
      document.documentElement.classList.add(`theme-${tg.colorScheme || 'light'}`);
    }
  }, []);

  const onClose = () => {
    if (telegram) {
      telegram.close();
    }
  };

  const showConfirm = (message, callback) => {
    if (telegram) {
      telegram.showConfirm(message, callback);
    }
  };

  const showPopup = (params) => {
    if (telegram) {
      telegram.showPopup(params);
    }
  };

  const sendData = (data) => {
    if (telegram) {
      telegram.sendData(JSON.stringify(data));
    }
  };

  const mainButtonHandler = {
    text: (text) => {
      if (telegram) {
        telegram.MainButton.text = text;
      }
    },
    show: () => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.show();
      }
    },
    hide: () => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.hide();
      }
    },
    onClick: (callback) => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.onClick(callback);
      }
    },
    offClick: (callback) => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.offClick(callback);
      } 
    },
    setText: (text) => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.setText(text);
      }
    },
    enable: () => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.enable();
      }
    },
    disable: () => {
      if (telegram && telegram.MainButton) {
        telegram.MainButton.disable();
      }
    }
  };

  return {
    telegram,
    user,
    ready,
    onClose,
    showConfirm,
    showPopup,
    sendData,
    mainButton: mainButtonHandler,
  };
}

// src/services/telegramService.js
const telegramService = {
  // Send order to Telegram bot
  sendOrder: async (order) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending order to Telegram:', error);
      throw error;
    }
  },
  
  // Get user data from Telegram WebApp
  getUserData: () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      return tg.initDataUnsafe?.user || {};
    }
    return {};
  },
  
  // Close Telegram WebApp
  closeApp: () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  },
  
  // Show alert
  showAlert: (message) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showAlert(message);
    }
  },
};

export default telegramService;