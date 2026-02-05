const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// @route   GET /api/cart
// @desc    Get user cart
// @access  Public (session-based)
router.get('/', cartController.getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Public (session-based)
router.post('/', cartController.addToCart);

// @route   PUT /api/cart/:productId
// @desc    Update cart item quantity
// @access  Public (session-based)
router.put('/:productId', cartController.updateCartItem);

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Public (session-based)
router.delete('/:productId', cartController.removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Public (session-based)
router.delete('/', cartController.clearCart);

module.exports = router;