// utils/db.js
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.url);
    this.db = null;
    this.connect(database);
  }

  async connect(database) {
    try {
      await this.client.connect();
      this.db = this.client.db(database);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB Client Error:', err);
    }
  }

  isAlive() {
    return this.client.isConnected(); // Returns true if connected, false otherwise
  }

  async nbUsers() {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.db) throw new Error('Database not connected');
    return this.db.collection('files').countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;
