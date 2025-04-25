// backend/src/controllers/settingsController.js
const StoreSettings = require('../models/StoreSettings');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

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