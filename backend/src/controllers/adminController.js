// backend/src/controllers/adminController.js
const Admin = require('../models/Admin');
const Game = require('../models/Game');
const Category = require('../models/Category');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { fetchGameData } = require('../utils/gameScraper');
const StoreSettings = require('../models/StoreSettings');

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username });
  
  // Validate credentials
  if (!username || !password) {
    console.log('Missing username or password');
    return next(new ErrorResponse('Пожалуйста, укажите имя пользователя и пароль', 400));
  }
  
  // Check for admin
  console.log('Looking for admin with username:', username);
  const admin = await Admin.findOne({ username }).select('+password');
  
  if (!admin) {
    console.log('Admin not found');
    return next(new ErrorResponse('Неверные учетные данные', 401));
  }
  
  console.log('Admin found:', admin._id);
  
  // Check password
  console.log('Comparing passwords...');
  const isMatch = await admin.matchPassword(password);
  
  console.log('Password match result:', isMatch);
  
  if (!isMatch) {
    console.log('Password does not match');
    return next(new ErrorResponse('Неверные учетные данные', 401));
  }
  
  // Generate token
  const token = admin.getSignedJwtToken();
  
  res.status(200).json({
    success: true,
    token,
    data: {
      id: admin._id,
      username: admin.username,
      role: admin.role
    }
  });
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
exports.getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);
  
  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get total games count
  const totalGames = await Game.countDocuments();
  
  // Get total categories count
  const totalCategories = await Category.countDocuments();
  
  // Get pending orders count
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  
  // Get completed orders count
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  
  res.status(200).json({
    success: true,
    data: {
      totalGames,
      totalCategories,
      pendingOrders,
      completedOrders
    }
  });
});

// @desc    Get all games
// @route   GET /api/admin/games
// @access  Private/Admin
exports.getGames = asyncHandler(async (req, res, next) => {
  try {
    const games = await Game.find().sort('-createdAt');
    
    // Ensure we're always returning an array
    res.status(200).json({
      success: true,
      count: games ? games.length : 0,
      data: games || [] // Return empty array if games is null/undefined
    });
  } catch (error) {
    console.error('Error in getGames controller:', error);
    return next(new ErrorResponse('Server error fetching games', 500));
  }
});

// @desc    Get single game
// @route   GET /api/admin/games/:id
// @access  Private/Admin
exports.getGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(
      new ErrorResponse(`Game not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: game
  });
});

// @desc    Create new game
// @route   POST /api/admin/games
// @access  Private/Admin
exports.createGame = asyncHandler(async (req, res, next) => {
  const game = await Game.create(req.body);
  
  res.status(201).json({
    success: true,
    data: game
  });
});

// @desc    Update game
// @route   PUT /api/admin/games/:id
// @access  Private/Admin
exports.updateGame = asyncHandler(async (req, res, next) => {
  let game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(
      new ErrorResponse(`Game not found with id of ${req.params.id}`, 404)
    );
  }
  
  game = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: game
  });
});

// @desc    Delete game
// @route   DELETE /api/admin/games/:id
// @access  Private/Admin
exports.deleteGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  
  if (!game) {
    return next(
      new ErrorResponse(`Game not found with id of ${req.params.id}`, 404)
    );
  }
  
  await game.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.find();
    
    // Ensure we're always returning an array
    res.status(200).json({
      success: true,
      count: categories ? categories.length : 0,
      data: categories || [] // Return empty array if categories is null/undefined
    });
  } catch (error) {
    console.error('Error in getCategories controller:', error);
    return next(new ErrorResponse('Server error fetching categories', 500));
  }
});

// @desc    Get single category
// @route   GET /api/admin/categories/:id
// @access  Private/Admin
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find().sort('-createdAt');
    
    // Ensure we're always returning an array
    res.status(200).json({
      success: true,
      count: orders ? orders.length : 0,
      data: orders || [] // Return empty array if orders is null/undefined
    });
  } catch (error) {
    console.error('Error in getOrders controller:', error);
    return next(new ErrorResponse('Server error fetching orders', 500));
  }
});

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }
  
  if (req.body.status) {
    order.status = req.body.status;
    order.updatedAt = Date.now();
    
    await order.save();
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Scrape game data from URL
// @route   POST /api/admin/scrape-game
// @access  Private/Admin
exports.scrapeGame = asyncHandler(async (req, res, next) => {
  const { url, categoryId } = req.body;
  
  if (!url) {
    return next(new ErrorResponse('Please provide a game URL', 400));
  }
  
  try {
    // Fetch game data from PlayStation Store
    const gameData = await fetchGameData(url);
    
    // If categoryId is provided, add it to the categories array
    if (categoryId) {
      gameData.categories = [categoryId];
    }
    
    // Create or update game in database
    let existingGame = await Game.findOne({ 
      title: gameData.title,
      releaseYear: gameData.releaseYear
    });
    
    let result;
    if (existingGame) {
      // Update existing game
      result = await Game.findByIdAndUpdate(existingGame._id, gameData, {
        new: true,
        runValidators: true
      });
    } else {
      // Create new game
      result = await Game.create(gameData);
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(new ErrorResponse(`Error scraping game data: ${error.message}`, 500));
  }
});

// @desc    Bulk scrape multiple games
// @route   POST /api/admin/bulk-scrape
// @access  Private/Admin
exports.bulkScrapeGames = asyncHandler(async (req, res, next) => {
  const { urls, categoryId } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return next(new ErrorResponse('Please provide an array of game URLs', 400));
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const url of urls) {
    try {
      // Fetch game data
      const gameData = await fetchGameData(url);
      
      // If categoryId is provided, add it to the categories array
      if (categoryId) {
        gameData.categories = [categoryId];
      }
      
      // Create or update game in database
      let existingGame = await Game.findOne({ 
        title: gameData.title,
        releaseYear: gameData.releaseYear
      });
      
      let result;
      if (existingGame) {
        // Update existing game
        result = await Game.findByIdAndUpdate(existingGame._id, gameData, {
          new: true,
          runValidators: true
        });
      } else {
        // Create new game
        result = await Game.create(gameData);
      }
      
      results.success.push({
        url,
        gameId: result._id,
        title: result.title
      });
    } catch (error) {
      results.failed.push({
        url,
        error: error.message
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      totalProcessed: urls.length,
      successCount: results.success.length,
      failedCount: results.failed.length,
      results
    }
  });
});


// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res, next) => {
  let settings = await StoreSettings.findOne();
  
  // If no settings exist, create default
  if (!settings) {
    settings = await StoreSettings.create({
      uahToRubRate: 2.5,
      defaultMarkup: 50
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const { uahToRubRate, defaultMarkup } = req.body;
  
  let settings = await StoreSettings.findOne();
  
  if (!settings) {
    settings = await StoreSettings.create({
      uahToRubRate,
      defaultMarkup,
      lastUpdated: Date.now()
    });
  } else {
    settings = await StoreSettings.findByIdAndUpdate(
      settings._id,
      { 
        uahToRubRate, 
        defaultMarkup,
        lastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    );
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Calculate price based on UAH price and markup
// @route   POST /api/admin/calculate-price
// @access  Private/Admin
exports.calculatePrice = asyncHandler(async (req, res, next) => {
  const { uahPrice, customMarkup } = req.body;
  
  if (!uahPrice) {
    return next(new ErrorResponse('Укажите цену в гривнах', 400));
  }
  
  const settings = await StoreSettings.findOne();
  
  if (!settings) {
    return next(new ErrorResponse('Настройки магазина не найдены', 404));
  }
  
  // Use custom markup if provided, otherwise use default
  const markup = customMarkup !== undefined ? customMarkup : settings.defaultMarkup;
  
  // Calculate RUB price: UAH price * exchange rate
  const costPrice = uahPrice * settings.uahToRubRate;
  
  // Apply markup
  const finalPrice = Math.round(costPrice * (1 + markup / 100));
  
  res.status(200).json({
    success: true,
    data: {
      uahPrice,
      rubExchangeRate: settings.uahToRubRate,
      costPrice: costPrice.toFixed(2),
      markup: markup,
      finalPrice
    }
  });
});



// @desc    Update game prices
// @route   POST /api/admin/update-prices
// @access  Private/Admin
exports.updateGamesPrices = asyncHandler(async (req, res, next) => {
  const { gameIds } = req.body;
  
  if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
    return next(new ErrorResponse('Please provide an array of game IDs', 400));
  }
  
  const results = {
    updatedGames: [],
    failedGames: []
  };
  
  for (const gameId of gameIds) {
    try {
      // Get game from database
      const game = await Game.findById(gameId);
      
      if (!game) {
        results.failedGames.push({
          gameId,
          error: 'Game not found'
        });
        continue;
      }
      
      // Check if game has SKU for scraping
      if (!game.sku) {
        results.failedGames.push({
          gameId,
          title: game.title,
          error: 'Game has no SKU for price update'
        });
        continue;
      }
      
      // In a real implementation, we would scrape updated price data
      // For now, we'll just update the prices randomly to simulate a price update

      // Simulate price update - in a real implementation, you would call fetchGameData with the game URL
      // Here we're just making random changes for demonstration purposes
      const randomDiscountPercentage = Math.floor(Math.random() * 30) + 5; // 5-35% discount
      const originalPrice = game.originalPrice;
      const discountPrice = Math.round(originalPrice * (1 - randomDiscountPercentage / 100));
      
      // Update game with new prices
      const updatedGame = await Game.findByIdAndUpdate(
        gameId,
        {
          discountPrice: discountPrice,
          discountPercentage: `-${randomDiscountPercentage}%`,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      results.updatedGames.push({
        _id: updatedGame._id,
        title: updatedGame.title,
        originalPrice: updatedGame.originalPrice,
        discountPrice: updatedGame.discountPrice,
        discountPercentage: updatedGame.discountPercentage
      });
    } catch (error) {
      results.failedGames.push({
        gameId,
        error: error.message
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      totalProcessed: gameIds.length,
      successCount: results.updatedGames.length,
      failedCount: results.failedGames.length,
      updatedGames: results.updatedGames
    }
  });
});