const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Импортируем модель Admin с правильным путем
const Admin = require('../models/Admin');

// Вывод для отладки
console.log('MongoDB URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/tg-game-store');

// Подключение к базе данных
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tg-game-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Успешное подключение к MongoDB!');
  
  try {
    // Проверка, существует ли администратор
    console.log('Проверка наличия администратора...');
    const adminExists = await Admin.findOne({ username: 'admin11' });
    
    if (adminExists) {
      console.log('Администратор уже существует:');
      console.log('Username:', adminExists.username);
      console.log('ID:', adminExists._id);
      process.exit(0);
    }
    
    // Создание нового администратора
    console.log('Создание нового администратора...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin11', salt);
    
    const admin = new Admin({
      username: 'admin11',
      password: hashedPassword,
      role: 'superadmin'
    });
    
    const savedAdmin = await admin.save();
    console.log('Администратор успешно создан!');
    console.log('Username:', savedAdmin.username);
    console.log('ID:', savedAdmin._id);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('Ошибка подключения к базе данных:', err);
  process.exit(1);
});