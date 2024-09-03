const { MongoClient } = require('mongodb');

// Database connecction constants
const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const URL = `mongodb://${HOST}:${PORT}`;

/**
 * DBClient class for managing MongoDB connections and operations.
 */
class DBClient {
  /**
   * Constructs a new DBClient instance and conneccts to the MongDB database.
   */
  constructor() {
    // Initializing the MongoDB client with connection URL
    this.client = new MongoClient(URL, { useUnifiedTopology: true });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DATABASE);
        console.log('Database connected successfully');
      })
      .catch((err) => {
        console.error('Connection error:', err);
      });
  }

  /**
   *  Checks if the MongoDB connection is alive.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    // Check if the client is connected and the topology is defined
    return this.client && this.client.topology && this.client.topology.isConnected()
      ? this.client.topology.isConnected() : false;
  }

  /**
   * Asynchronously retrieves the number of documents in the 'users' collection.
   * @returns {Promise<number>} The number of users.
   */
  async nbUsers() {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }
      const users = this.db.collection('users');
      return await users.countDocuments();
    } catch (error) {
      console.error('Error fetching number of users:', error);
      throw error; // rethrow to allow further handling
    }
  }

  /**
   * Asynchronously retrieves the number of documents in the 'files' collection.
   * @returns {Promise<number>} The number of files.
   * @throws {Error} If the database is not connected
   */
  async nbFiles() {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }
      const files = this.db.collection('files');
      return await files.countDocuments();
    } catch (error) {
      console.error('Error fetching number of files:', error);
      throw error; // rethrow to allow further handling
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
