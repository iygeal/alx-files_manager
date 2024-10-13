// utils/db.js
import { MongoClient } from 'mongodb';

// Define environment variables with fallback defaults
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const mongoUrl = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    // Create the MongoDB client
    this.client = new MongoClient(mongoUrl, { useUnifiedTopology: true });
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(database);
        // console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  // Check if the MongoDB connection is alive
  isAlive() {
    return this.client.isConnected();
  }

  // Get the number of users in the 'users' collection
  async nbUsers() {
    const usersCollection = this.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    return userCount;
  }

  // Get the number of files in the 'files' collection
  async nbFiles() {
    const filesCollection = this.db.collection('files');
    const fileCount = await filesCollection.countDocuments();
    return fileCount;
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
