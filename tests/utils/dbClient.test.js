// /* eslint-disable */
// const { MongoClient } = require('mongodb');

// const dbClient = require('../utils/db');

// describe('dbClient', () => {
//   it('should connect to MongoDB successfully', async () => {
//     const result = await dbClient.isAlive();
//     expect(result).toBe(true);
//   });

//   it('should insert and find documents correctly', async () => {
//     const db = dbClient.db.collection('test');
//     const doc = { name: 'test' };
//     await db.insertOne(doc);

//     const foundDoc = await db.findOne({ name: 'test' });
//     expect(foundDoc.name).toBe('test');
//   });
// });
