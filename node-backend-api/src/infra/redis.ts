import { createClient } from 'redis';

console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD);
console.log('KAFKA_BROKER:', process.env.KAFKA_BROKER);

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD || 'your_password';

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: Number(redisPort),
  },
  password: redisPassword,
});

redisClient.connect().then(() => {
  console.log(`Redis client connected to ${redisHost}:${redisPort}`);
}).catch(console.error);


const RedisClient = {
    getClient: () => redisClient,
    get: async (key: string) => {
       let response = null;
       try {
            response = await redisClient.get(key);
            return response;
       } catch (error) {
           console.error('Error in RedisClient.get:', error);
       }
        return response;
    },
    set: async (key: string, value: string) => {
       return redisClient.set(key, value);
    },
};

export default RedisClient;