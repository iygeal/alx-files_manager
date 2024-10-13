import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  // Method to handle GET /status
  static getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    // Respond with the Redis and MongoDB statuses
    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  // Method to handle GET /stats
  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    // Respond with the number of users and files
    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
