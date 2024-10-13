// utils/redis.js
import redis from 'redis';

class RedisClient {
  constructor() {
    // Initialize the Redis client
    this.client = redis.createClient();

    // Handle Redis connection errors
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  // Method to check if Redis is alive (connected)
  isAlive() {
    return this.client.connected;
  }

  // Method to get the value of a key from Redis (asynchronous)
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          console.error('Redis GET Error:', err);
          return reject(err);
        }
        resolve(value);
      });
    });
  }

  // Method to set a key-value pair in Redis with expiration (asynchronous)
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err) => {
        if (err) {
          console.error('Redis SET Error:', err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  // Method to delete a key from Redis (asynchronous)
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          console.error('Redis DEL Error:', err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
