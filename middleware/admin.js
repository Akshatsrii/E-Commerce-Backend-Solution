// Check if user is admin (for API routes)
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    success: false, 
    message: 'Access denied. Admin privileges required.' 
  });
};

// Check if user is admin (for session-based routes)
exports.isAdminSession = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  req.session.error = 'Access denied. Admin privileges required.';
  res.redirect('/');
};