const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Admin = require('../models/Admin');

// Logging middleware для отладки запросов
exports.logRequest = (req, res, next) => {
  console.log('\n--- Incoming Request Log ---');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    // Маскируем пароль для безопасности в логах
    const sanitizedBody = {...req.body};
    if (sanitizedBody.password) {
      sanitizedBody.password = '********';
    }
    console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
  }
  
  console.log('------------------------\n');
  next();
};

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  console.log('Auth middleware triggered');
  
  // Check authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found:', token ? 'Yes' : 'No');
  }
  
  // Check if token exists
  if (!token) {
    console.log('No token found, unauthorized');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  
  try {
    // Verify token
    console.log('Verifying token...');
    console.log('JWT_SECRET:', process.env.JWT_SECRET || 'secret123');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    // Find admin by ID
    const admin = await Admin.findById(decoded.id);
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('Admin not found in database');
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    req.admin = admin;
    console.log('Authentication successful for admin:', admin.username);
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});