const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper function to calculate cart total
const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Get user cart
exports.getCart = async (req, res) => {
  try {
    // For session-based cart
    if (!req.session.cart) {
      req.session.cart = { items: [], total: 0 };
    }
    
    res.json({
      success: true,
      cart: req.session.cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching cart' 
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient stock' 
      });
    }
    
    // Initialize cart if doesn't exist
    if (!req.session.cart) {
      req.session.cart = { items: [], total: 0 };
    }
    
    // Check if product already in cart
    const existingItemIndex = req.session.cart.items.findIndex(
      item => item.product._id.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = req.session.cart.items[existingItemIndex].quantity + parseInt(quantity);
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock for requested quantity' 
        });
      }
      
      req.session.cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      req.session.cart.items.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        },
        quantity: parseInt(quantity)
      });
    }
    
    // Recalculate total
    req.session.cart.total = req.session.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: 'Product added to cart',
      cart: req.session.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding to cart' 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!req.session.cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      });
    }
    
    const itemIndex = req.session.cart.items.findIndex(
      item => item.product._id.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }
    
    // Check stock
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient stock' 
      });
    }
    
    req.session.cart.items[itemIndex].quantity = parseInt(quantity);
    
    // Recalculate total
    req.session.cart.total = req.session.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: 'Cart updated',
      cart: req.session.cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating cart' 
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!req.session.cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }
    
    req.session.cart.items = req.session.cart.items.filter(
      item => item.product._id.toString() !== productId
    );
    
    // Recalculate total
    req.session.cart.total = req.session.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: req.session.cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing from cart' 
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    req.session.cart = { items: [], total: 0 };
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: req.session.cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing cart' 
    });
  }
};