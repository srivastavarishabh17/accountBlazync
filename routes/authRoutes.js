const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();
const LoginLog = require('../models/Log'); // optional: if logging to DB

// Register Route - Show Registration Form


router.get('/register', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.render('register', { products });  // Pass to EJS
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register Route - Handle Form Submission
router.post('/register', async (req, res) => {
  const { username, password, product } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      password: hashedPassword,
      products: [product]
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  const { username, password, redirect } = req.query;  // <-- changed from req.body
console.log(req.query)
  if (!password || (!username)) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ username }],
    });

    if (!user) {
      await logAttempt(null, req.ip, false);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

 // Compare the hashed password received in the query with the stored hashed password
 if (password !== user.password) {
  await logAttempt(user._id, req.ip, false);
  return res.status(400).json({ message: 'Invalid credentials Password' });
}

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await logAttempt(user._id, req.ip, true);
    if (redirect) {
      // Append the access token to the redirect URL
      const redirectUrl = `${redirect}?access_token=${token}`;
      return res.redirect(redirectUrl);
    }
    
    res.json({
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logging function remains the same
async function logAttempt(userId, ip, success) {
  try {
    await LoginLog.create({
      user: userId,
      ip,
      success,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Login logging failed:', err);
  }
}



// Login Route - Show Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Route - Handle Form Submission
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store token in session
    req.session.token = token;

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/logout', (req, res) => {
  // Destroy the session (if using express-session)
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    // Redirect to the login page or home page
    res.redirect('/auth/login');
  });
});
module.exports = router;
