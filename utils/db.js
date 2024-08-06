// utils/db.js
import MongoClient from 'mongodb';

class DBClient {
  constructor() {
    // const host = process.env.DB_HOST || 'localhost';
    // const port = process.env.DB_PORT || 27017;
    // const database = process.env.DB_DATABASE || 'file_manager';

    // this.url = `mongodb://${host}:${port}`;
    // this.client = new MongoClient(this.url);
    // this.dbName = database;

    // // Database Connection
    // this.client.connect().then(() => {
    //   console.log('MongoDB client connected successfully');
    // }).catch((err) => {
    //   console.error('MongoDB client Error', err);
    // });

    this.client = null;
    this.database = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      this.database = this.client.db(process.env.DB_DATABASE || 'files_manager');
      this.isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      this.isConnected = false;
    }
  }

  isAlive() {
    return this.isConnected; // Returns true or false
  }

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Database not connected');
    }
    const usersCollection = this.database.collection('users');
    return await usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Database not connected');
    }
    const filesCollection = this.database.collection('files');
    return await filesCollection.countDocuments();
  }
}

// Create and exports an instance of DBClient
const DbClient = new DBClient();
module.exports = DbClient;
