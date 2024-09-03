const sha1 = require('sha1'); // Import the sha1 module for hashing passwords
const { ObjectId } = require('mongodb'); // Import ObjectId from the MongoDB library
const redisClient = require('../utils/redis'); // Correctly import the Redis client utility
const dbClient = require('../utils/db'); // Import the DB utility

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body; // Extract email and password from the request body

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists in the database
    const existingUser = await dbClient.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create the new user object
    const newUser = {
      email,
      password: hashedPassword,
    };

    // Insert the new user into the database
    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Respond with the new user's id and email
      return res.status(201).json({ id: result.insertedId, email: newUser.email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // New endpoint for retrieving user information based on the token
  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user in the database
    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user object (email and id only)
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
