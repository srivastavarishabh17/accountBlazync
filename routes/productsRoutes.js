const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// CREATE Product
router.post('/', async (req, res) => {
  const { name, description, clientId, clientSecret, redirectUris } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      clientId,
      clientSecret,
      redirectUris
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// READ All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('users', 'username');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// READ Single Product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('users', 'username');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE Product
router.put('/:id', async (req, res) => {
  const { name, description, clientId, clientSecret, redirectUris, isActive } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        clientId,
        clientSecret,
        redirectUris,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE Product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
