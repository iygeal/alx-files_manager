import { Buffer } from 'buffer';
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8'
    );
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db
      .collection('users')
      .findOne({ email, password: sha1(password) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a token
    const token = uuidv4();
    const tokenKey = `auth_${token}`;

    // Store token in Redis with a 24-hour expiration
    await redisClient.set(tokenKey, String(user._id), 60 * 60 * 24);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete token from Redis
    await redisClient.del(tokenKey);

    return res.status(204).send();
  }
}

export default AuthController;
