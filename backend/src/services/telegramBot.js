const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Initialize bot
const bot = botToken ? new Telegraf(botToken) : null;

// Start bot if token is provided
if (bot) {
  bot.launch().catch(err => {
    console.error('Error launching Telegram bot:', err);
  });
  
  console.log('Telegram bot started');
} else {
  console.log('Telegram bot not initialized: Bot token not provided');
}

const telegramBot = {
  // Send order notification to customer
  sendOrderConfirmation: async (order, chatId) => {
    if (!bot || !chatId) return;
    
    try {
      const message = `
🎮 *Заказ оформлен!*

Номер заказа: \`${order._id}\`
Статус: ${order.status === 'pending' ? '⏳ Ожидает обработки' : order.status === 'completed' ? '✅ Выполнен' : '❌ Отменен'}
Сумма: ${order.total} ₽

*Товары:*
${order.items.map(item => `- ${item.title} (${item.edition}) - ${item.price} ₽`).join('\n')}

Спасибо за заказ! Мы свяжемся с вами в ближайшее время.
`;
      
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Подтвердить получение', callback_data: `confirm_order_${order._id}` }]
          ]
        }
      });
    } catch (error) {
      console.error('Error sending order confirmation to Telegram:', error);
    }
  },
  
  // Send order notification to admin
  sendOrderNotification: async (order) => {
    if (!bot || !adminChatId) return;
    
    try {
      const message = `
📦 *Новый заказ!*

Номер заказа: \`${order._id}\`
Пользователь: ${order.username ? `@${order.username}` : `ID: ${order.userId}`}
Сумма: ${order.total} ₽

*Товары:*
${order.items.map(item => `- ${item.title} (${item.edition}) - ${item.price} ₽`).join('\n')}
`;
      
      await bot.telegram.sendMessage(adminChatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Выполнить', callback_data: `complete_order_${order._id}` },
              { text: '❌ Отменить', callback_data: `cancel_order_${order._id}` }
            ]
          ]
        }
      });
    } catch (error) {
      console.error('Error sending order notification to Telegram:', error);
    }
  },
  
  // Send order status update
  sendOrderStatusUpdate: async (order) => {
    if (!bot || !order.userId) return;
    
    try {
      const statusText = order.status === 'completed' ? 
        '✅ Ваш заказ выполнен! Проверьте сообщения бота.' : 
        (order.status === 'cancelled' ? '❌ Ваш заказ отменен.' : '⏳ Статус заказа обновлен.');
      
      const message = `
🔔 *Обновление статуса заказа*

Номер заказа: \`${order._id}\`
Статус: ${statusText}

${order.status === 'completed' ? 'Спасибо за покупку! Будем рады видеть вас снова.' : ''}
`;
      
      await bot.telegram.sendMessage(order.userId, message, {
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Error sending status update to Telegram:', error);
    }
  }
};

// Register bot command handlers
if (bot) {
  // Start command
  bot.start((ctx) => {
    ctx.reply('Добро пожаловать в магазин игр! Используйте кнопку меню для навигации.');
  });
  
  // Help command
  bot.help((ctx) => {
    ctx.reply('Используйте кнопку меню для навигации по магазину. Для заказа игры выберите ее и добавьте в корзину.');
  });
  
  // Handle callback queries for order actions
  bot.action(/complete_order_(.+)/, async (ctx) => {
    try {
      const orderId = ctx.match[1];
      
      // Update order status in database (would be implemented in a real app)
      // await Order.findByIdAndUpdate(orderId, { status: 'completed' });
      
      ctx.answerCbQuery('Заказ отмечен как выполненный');
      ctx.editMessageText(`Заказ ${orderId} отмечен как выполненный.`);
    } catch (error) {
      ctx.answerCbQuery('Ошибка при обновлении заказа');
      console.error('Error handling complete order callback:', error);
    }
  });
  
  bot.action(/cancel_order_(.+)/, async (ctx) => {
    try {
      const orderId = ctx.match[1];
      
      // Update order status in database (would be implemented in a real app)
      // await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
      
      ctx.answerCbQuery('Заказ отменен');
      ctx.editMessageText(`Заказ ${orderId} отменен.`);
    } catch (error) {
      ctx.answerCbQuery('Ошибка при отмене заказа');
      console.error('Error handling cancel order callback:', error);
    }
  });
  
  bot.action(/confirm_order_(.+)/, async (ctx) => {
    try {
      const orderId = ctx.match[1];
      
      ctx.answerCbQuery('Спасибо за подтверждение!');
      ctx.editMessageText(`Спасибо за подтверждение получения заказа ${orderId}!`);
    } catch (error) {
      ctx.answerCbQuery('Ошибка при подтверждении');
      console.error('Error handling confirm order callback:', error);
    }
  });
}

module.exports = telegramBot;