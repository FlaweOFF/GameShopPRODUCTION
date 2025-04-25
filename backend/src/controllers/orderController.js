const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const telegramBot = require('../services/telegramBot');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, total, userId, username } = req.body;
  
  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ErrorResponse('Please add at least one item to the order', 400));
  }
  
  if (!total || isNaN(parseFloat(total))) {
    return next(new ErrorResponse('Please provide a valid total amount', 400));
  }
  
  if (!userId) {
    return next(new ErrorResponse('User ID is required', 400));
  }
  
  // Create order
  const order = await Order.create({
    userId,
    username,
    items,
    total,
    status: 'pending'
  });
  
  // Send order notification to Telegram
  try {
    await telegramBot.sendOrderNotification(order);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    // Don't fail the request if Telegram notification fails
  }
  
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
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
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Only allow updating status
  if (req.body.status) {
    order.status = req.body.status;
    order.updatedAt = Date.now();
    
    await order.save();
    
    // Send status update notification to Telegram
    try {
      await telegramBot.sendOrderStatusUpdate(order);
    } catch (error) {
      console.error('Failed to send Telegram status update:', error);
      // Don't fail the request if Telegram notification fails
    }
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});