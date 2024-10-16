// /* eslint-disable */
// const redisClient = require('../../utils/redis');

// // Mock the Redis client
// jest.mock('redis');

// describe('redisClient', () => {
//   it('should set and get data correctly', async () => {
//     await redisClient.set('key', 'value');
//     const result = await redisClient.get('key');
//     expect(result).toBe('value');
//   });

//   it('should delete data correctly', async () => {
//     await redisClient.set('key', 'value');
//     await redisClient.del('key');
//     const result = await redisClient.get('key');
//     expect(result).toBeNull();
//   });
// });
