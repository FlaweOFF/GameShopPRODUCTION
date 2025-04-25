const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all games
// @route   GET /api/games
// @access  Public
exports.getGames = asyncHandler(async (req, res, next) => {
  const games = await Game.find();
  
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
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

// @desc    Get featured games
// @route   GET /api/games/featured
// @access  Public
exports.getFeaturedGames = asyncHandler(async (req, res, next) => {
  const featuredGames = await Game.find({ isFeatured: true });
  
  res.status(200).json({
    success: true,
    count: featuredGames.length,
    data: featuredGames
  });
});

// @desc    Get weekly discounts
// @route   GET /api/games/discounts
// @access  Public
exports.getWeeklyDiscounts = asyncHandler(async (req, res, next) => {
  const discountGames = await Game.find({ isWeeklyDiscount: true });
  
  res.status(200).json({
    success: true,
    count: discountGames.length,
    data: discountGames
  });
});

// @desc    Get bestsellers
// @route   GET /api/games/bestsellers
// @access  Public
exports.getBestsellers = asyncHandler(async (req, res, next) => {
  const bestsellers = await Game.find({ isBestseller: true });
  
  res.status(200).json({
    success: true,
    count: bestsellers.length,
    data: bestsellers
  });
});

// @desc    Get games by category
// @route   GET /api/games/category/:categoryId
// @access  Public
exports.getGamesByCategory = asyncHandler(async (req, res, next) => {
  const games = await Game.find({
    categories: req.params.categoryId
  });
  
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});