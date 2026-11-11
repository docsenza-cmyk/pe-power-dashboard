// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("URI:", process.env.MONGODB_URI);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',          // your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true                         // if you use cookies/sessions later
}));

app.use(express.json());                    // parse JSON bodies

// Connect to MongoDB – NO deprecated options
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => {
    console.error('MongoDB connection FAILED:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/parameters', require('./routes/parameter'));
app.use('/api/facilities', require('./routes/facility'));

// Simple root route for testing
app.get('/', (req, res) => {
  res.send('PE Power Backend is running on http://localhost:5000');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});