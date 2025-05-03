// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const authmiddlewares = require('../middlewares/auth');

// Middleware for JWT or session verification would be here

// Dashboard Route
router.get('/',authmiddlewares, (req, res) => {
  res.render('dashboard');
});

// Manage Products Route
router.get('/products',authmiddlewares, async (req, res) => {
  try {
    const products = await Product.find().populate('users'); // Fetch all products
    res.render('manage-products', { title: 'Manage Products', products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Manage Users Route
router.get('/users',authmiddlewares, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.render('manage-users', { title: 'Manage Users', users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
