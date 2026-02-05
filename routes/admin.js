const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Product Management
// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private/Admin
router.post('/products', adminController.createProduct);

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/products/:id', adminController.updateProduct);

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/products/:id', adminController.deleteProduct);

// Order Management
// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', adminController.getAllOrders);

// @route   PUT /api/admin/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id', adminController.updateOrderStatus);

// Dashboard
// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', adminController.getDashboardStats);

// User Management
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', adminController.getAllUsers);

module.exports = router;