const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', orderController.createOrder);

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', verifyToken, orderController.getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', verifyToken, orderController.getOrder);

// @route   POST /api/orders/payment-intent
// @desc    Create payment intent
// @access  Public (session-based)
router.post('/payment-intent', orderController.createPaymentIntent);

module.exports = router;