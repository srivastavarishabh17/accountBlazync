const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.session.token;
  if (!token) {
    // Redirect to login page if no token
    return res.redirect('/auth/login');
  }

  try {
    // Verify token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Store user ID in the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // If token is invalid, redirect to login page
    return res.redirect('/auth/login');
  }
};

module.exports = authenticate;
