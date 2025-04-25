// backend/src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const gameRoutes = require('./routes/gameRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { connectDB } = require('./config/database');

// Initialize app
const app = express();

// Middleware
// Configure CORS to allow requests from admin panel
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to database
connectDB();

// Debug requests - logging all requests to console in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for checking API status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  // Serve admin panel
  app.use('/admin', express.static(path.join(__dirname, '../../admin-panel/build')));
  
  // Handle frontend routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
  
  // Handle admin panel routes
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin-panel/build', 'index.html'));
  });
  
  // Handle all other routes
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/admin')) {
      res.sendFile(path.join(__dirname, '../../admin-panel/build', 'index.html'));
    } else {
      res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = app;