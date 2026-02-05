// Global utility functions
const showAlert = (message, type = 'success') => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => alertDiv.remove(), 5000);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Add to cart functionality
const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId, quantity })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Product added to cart!', 'success');
      updateCartCount();
    } else {
      showAlert(data.message || 'Failed to add to cart', 'error');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    showAlert('Error adding to cart', 'error');
  }
};

// Update cart count in navbar
const updateCartCount = async () => {
  try {
    const response = await fetch('/api/cart');
    const data = await response.json();
    
    if (data.success) {
      const cartCount = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const countElement = document.querySelector('.cart-count');
      
      if (countElement) {
        countElement.textContent = cartCount;
        countElement.style.display = cartCount > 0 ? 'flex' : 'none';
      }
    }
  } catch (error) {
    console.error('Update cart count error:', error);
  }
};

// Update cart item quantity
const updateCartQuantity = async (productId, quantity) => {
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: parseInt(quantity) })
    });
    
    const data = await response.json();
    
    if (data.success) {
      location.reload();
    } else {
      showAlert(data.message || 'Failed to update quantity', 'error');
    }
  } catch (error) {
    console.error('Update quantity error:', error);
    showAlert('Error updating quantity', 'error');
  }
};

// Remove item from cart
const removeFromCart = async (productId) => {
  if (!confirm('Remove this item from cart?')) return;
  
  try {
    const response = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Item removed from cart', 'success');
      location.reload();
    } else {
      showAlert(data.message || 'Failed to remove item', 'error');
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    showAlert('Error removing item', 'error');
  }
};

// Authentication
const handleLogin = async (event) => {
  event.preventDefault();
  
  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Error logging in', 'error');
  }
};

const handleRegister = async (event) => {
  event.preventDefault();
  
  const form = event.target;
  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Registration successful! Logging you in...', 'success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      showAlert(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Register error:', error);
    showAlert('Error registering', 'error');
  }
};

// Admin functions
const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Product deleted successfully', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert(data.message || 'Failed to delete product', 'error');
    }
  } catch (error) {
    console.error('Delete product error:', error);
    showAlert('Error deleting product', 'error');
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert('Order status updated', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert(data.message || 'Failed to update status', 'error');
    }
  } catch (error) {
    console.error('Update order status error:', error);
    showAlert('Error updating status', 'error');
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count
  updateCartCount();
  
  // Attach event listeners
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Quantity input change handlers
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = e.target.dataset.productId;
      const quantity = e.target.value;
      updateCartQuantity(productId, quantity);
    });
  });
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.showAlert = showAlert;