const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'Please add a user ID']
  },
  username: {
    type: String,
    default: ''
  },
  items: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    edition: {
      type: String,
      default: 'Standard Edition'
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: [true, 'Please add a total price']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);