module.exports = {
    apps: [
      {
        name: 'tg-game-store',
        script: 'backend/src/server.js',
        env: {
          NODE_ENV: 'production',
          PORT: 5000,
          MONGO_URI: 'mongodb://localhost:27017/tg-game-store',
          JWT_SECRET: 'OQjfjsa532n5hsANSfh2577881smjJSfh',
          JWT_EXPIRE: '30d',
          TELEGRAM_BOT_TOKEN: '7579441191:AAGEabVDuq2Wj-dHu_zQ4Rn6soIWQErNpxo',
          TELEGRAM_ADMIN_CHAT_ID: '252679400',
          DOMAIN: 'gameparadice.ru'
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
      }
    ]
  };