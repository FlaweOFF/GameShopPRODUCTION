// Скрипт инициализации MongoDB для продакшен-сервера
// Запустите этот скрипт после создания базы данных для настройки пользователя и прав доступа
// mongo < init-mongodb.js

// Создание пользователя базы данных
db = db.getSiblingDB('admin');
db.createUser({
  user: "admin",
  pwd: "TTTwyu9010",  // Замените на безопасный пароль
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
});

// Переключение на базу данных приложения
db = db.getSiblingDB('tg-game-store');

// Создание пользователя приложения
db.createUser({
  user: "tg_game_store_user",
  pwd: "TTTwyu9010",  // Замените на безопасный пароль
  roles: [
    { role: "readWrite", db: "tg-game-store" }
  ]
});

// Создание индексов
db.admins.createIndex({ "username": 1 }, { unique: true });
db.games.createIndex({ "title": 1 });
db.games.createIndex({ "categories": 1 });
db.games.createIndex({ "isFeatured": 1 });
db.games.createIndex({ "isWeeklyDiscount": 1 });
db.games.createIndex({ "isBestseller": 1 });
db.categories.createIndex({ "name": 1 }, { unique: true });
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

print("MongoDB настройка завершена!");


