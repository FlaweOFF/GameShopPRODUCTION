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