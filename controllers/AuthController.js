const sha1 = require('sha1'); // Import the sha1 module for hashing passwords
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating random tokens
const redisClient = require('../utils/redis'); // Import the Redis client utility
const dbClient = require('../utils/db'); // Import the DB utility

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode the base64 encoded email:password
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user in the database
    const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token
    const token = uuidv4();
    const key = `auth_${token}`;

    // Store the user ID in Redis with the generated token
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60); // Expire in 24 hours
    console.log(`Token stored in Redis with key: ${key} for user ID: ${user._id}`); // Debugging log

    // Return the token
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.del(`auth_${token}`);
    console.log(`Token ${token} deleted from Redis`); // Debugging log
    return res.status(204).send();
  }
}

module.exports = AuthController;
