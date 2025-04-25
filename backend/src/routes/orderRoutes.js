const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder
} = require('../controllers/orderController');

const router = express.Router();

router.route('/').post(createOrder).get(getOrders);
router.route('/:id').get(getOrder).put(updateOrder);

module.exports = router;