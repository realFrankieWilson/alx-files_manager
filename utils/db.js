import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';
const URL = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    // Initializing the database
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

  isAlive() {
    // Check if the client is connected and the topology is defined
    return this.client.topology?.isConnected() ?? false;
  }

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
