// utils/redis.js
const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Handles connection errors
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    // Check if the client is connected
    this.readyPromise = new Promise((res) => {
      this.client.on('ready', () => {
        res();
      });
    });
  }

  async connect() {
    await this.readyPromise; // Wait for the client to be ready
  }

  isAlive() {
    return this.client.connected; // Returns true or false as the case may be.
  }

  async get(key) {
    return new Promise((res, rej) => {
      this.client.get(key, (err, value) => {
        if (err) {
          rej(err);
        } else {
          res(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((res, rej) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    });
  }

  async del(key) {
    return new Promise((res, rej) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    });
  }
}

// Creation and exportation of the RedisCleint instance.
const redisClient = new RedisClient();
module.exports = redisClient;
