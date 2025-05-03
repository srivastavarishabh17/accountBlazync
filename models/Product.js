const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate product names
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  clientId: {
    type: String,
    required: true,
    unique: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  redirectUris: [{
    type: String,
    required: true
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
