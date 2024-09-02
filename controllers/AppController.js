const redisClient = require('../utils/redis'); // Import your Redis client utility
const dbClient = require('../utils/db'); // Import your DB client utility

class AppController {
  static async getStatus(req, res) {
    const redisStatus = redisClient.isAlive(); // Check if Redis is alive
    const dbStatus = dbClient.isAlive(); // Check if the DB is alive
    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers(); // Count users in the DB
      const filesCount = await dbClient.nbFiles(); // Count files in the DB
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AppController;
