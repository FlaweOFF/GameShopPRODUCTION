const express = require('express');
const {
  login,
  getAdminProfile,
  createGame,
  updateGame,
  deleteGame,
  createCategory,
  updateCategory,
  deleteCategory,
  scrapeGame,
  bulkScrapeGames,
  getDashboardStats,
  getGames,
  getGame,
  getCategories,
  getCategory,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateGamesPrices,
  getSettings,
  updateSettings,
  calculatePrice
} = require('../controllers/adminController');

const { protect, logRequest } = require('../middlewares/auth');

const router = express.Router();

// Apply logging middleware to all admin routes
router.use(logRequest);

// Auth routes
router.post('/login', login);
router.get('/profile', protect, getAdminProfile);

// Dashboard
router.get('/dashboard', protect, getDashboardStats);

// Game management
router.route('/games')
  .get(protect, getGames)
  .post(protect, createGame);

router.route('/games/:id')
  .get(protect, getGame)
  .put(protect, updateGame)
  .delete(protect, deleteGame);

// Category management
router.route('/categories')
  .get(protect, getCategories)
  .post(protect, createCategory);

router.route('/categories/:id')
  .get(protect, getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

// Order management
router.route('/orders')
  .get(protect, getOrders);

router.route('/orders/:id')
  .get(protect, getOrder)
  .put(protect, updateOrderStatus);

// Game scraping
router.post('/scrape-game', protect, scrapeGame);
router.post('/bulk-scrape', protect, bulkScrapeGames);

// Update game prices
router.post('/update-prices', protect, updateGamesPrices);

// Store Settings
router.route('/settings')
  .get(protect, getSettings)
  .put(protect, updateSettings);

// Price calculator
router.post('/calculate-price', protect, calculatePrice);

module.exports = router;