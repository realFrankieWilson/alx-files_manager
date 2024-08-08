// controllers/AppController.js
const mongoose = require('mongoose');

// User and file models
const User = mongoose.model('User', new mongoose.Schema({ /* schema definition */ }));
const File === mongoose.model('File', new mongoose.Schema({ /* schema definition */ }));

exports.getStatus = async (req, res) => {
  try {
    const dbStatus = await mongoose.connection.readyState === 1;  // Connected
    const redisStatus = await new Promise((resolve) => {
      redisClient.ping((err, reply) => {
        resolve(reply === 'PONG');
      });
    });

    res.status(200).json({ redis: redisStatus, db: dbStatus });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const fileCount = await File.countDocuments();

    res.status(200).json({ users: userCount, files: fileCount });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
