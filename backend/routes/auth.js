const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login / Register
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // First time - create user (no password yet)
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.email.endsWith('@yourcompany.com') ? 'admin' : 'user', // optional auto-admin
      });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Set password (after first Google login)
router.post('/set-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.password) return res.status(400).json({ message: 'Password already set' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password set successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting password' });
  }
});

// Email + Password Login (fallback)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login error' });
  }
});

module.exports = router;



router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Received Google token from frontend:', token.substring(0, 30) + '...'); // partial log

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google payload:', payload.email, payload.name);

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        role: 'user', // or your logic
      });
      await user.save();
      console.log('New user created:', user.email);
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error('Google auth ERROR:', err.message);
    console.error('Full error:', err);
    res.status(401).json({ message: 'Google authentication failed: ' + err.message });
  }
});