const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Session setup
// Use express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key', // You can set a secret for the session
  resave: false, // Whether to resave the session if unmodified
  saveUninitialized: false, // Don't save empty sessions
  cookie: { secure: false } // Set to true if using https
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productsRoutes'));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
