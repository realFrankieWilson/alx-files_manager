// server.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/frankie', { useNewParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connected error:', err));

// Connect to MongoDB
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Redis error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
