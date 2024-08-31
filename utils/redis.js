import redis from 'redis';

const host = 'localhost';
const port = 6379;

/**
 * Class representing a Redis client.
 */
class RedisClient {
  /**
   * Create a Redis client.
   * Initializes a connection to the Redis server and sets up error handling.
   */
  constructor() {
    this.client = redis.createClient({ host, port });

    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  /**
   * Check if the Redis connection is alive.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Get the value associated with a key from Redis.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<string|null>} The value stored in Redis or null if not found.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (!err) {
          resolve(value);
        }
        return reject(err);
      });
    });
  }

  /**
   * Set a value in Redis with an expiration time.
   * @param {string} key - The key to store the value under.
   * @param {string} value - The value to store.
   * @param {number} duration - The duration in seconds for which the key should be valid
   * @returns {Promise<void>} Resolves when the value is set.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => {
        if (!err) {
          resolve();
        }
        return reject(err);
      });
    });
  }

  /**
   * Delete a key and its associated value from Redis.
   * @param {string} key - The key to delete
   * @returns {Promise<void>} Resolves when the key is deleted.
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (!err) {
          resolve();
        }
        return reject(err);
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
