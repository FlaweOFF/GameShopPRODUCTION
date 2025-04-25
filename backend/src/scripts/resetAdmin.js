const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Подключение к БД
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tg-game-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Определите схему и модель администратора
    const AdminSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const Admin = mongoose.model('Admin', AdminSchema);
    
    // Удалите существующего админа (если есть)
    await Admin.deleteMany({ username: 'admin11' });
    console.log('Deleted existing admin');
    
    // Создайте нового админа с явным хешированием
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin11', salt);
    
    const newAdmin = new Admin({
      username: 'admin11',
      password: hashedPassword,
      role: 'superadmin'
    });
    
    await newAdmin.save();
    console.log('Created new admin: admin11/admin11');
    
    // Проверка - найдите созданного админа
    const foundAdmin = await Admin.findOne({ username: 'admin11' });
    console.log('Found admin:', foundAdmin);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});