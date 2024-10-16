import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createClient } from 'redis';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });
dotenv.config();

const requestCounter = new Counter({
  name: 'api_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(requestCounter);

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock API with Redis Cache',
      version: '1.0.0',
      description: 'A simple Node.js API with Swagger documentation and Redis Cache integration',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/app.ts'], // Adjust the path as necessary
};


const specs = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(express.json());

console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD);
console.log('KAFKA_BROKER:', process.env.KAFKA_BROKER);

const kafka = new Kafka({
  clientId: 'mock-api',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});
const producer = kafka.producer();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD || '';

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: Number(redisPort),
  },
  password: redisPassword,
});

redisClient.connect().then( () => console.log(`
  Redis client connected to ${redisHost}:${redisPort}
`)).catch(console.error);


app.use((req: Request, res: Response, next) => {
  res.on('finish', () => {
    console.log('Request logged:', req.method, req.url, res.statusCode);  // Log para verificar
    requestCounter.labels(req.method, req.route?.path || req.url, res.statusCode.toString()).inc();
  });
  next();
});


// API route for creating a user
/**
 * @swagger
 * /mock/user:
 *   post:
 *     summary: Create mock user data
 *     description: Generates mock user data and stores it in Redis cache
 *     requestBody:
 *       description: User information (if needed)
 *       required: false
 *     responses:
 *       200:
 *         description: Mock user data created and cached
 */
app.post('/mock/user', async (req: Request, res: Response) => {
    const mockData = generateMockUser();

    const cacheKey = mockData.id.toString();
    const ttl = 300; // 5 minutes
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(mockData));

    await producer.send({
      topic: 'mock-user-topic',
      messages: [
          { value: JSON.stringify(mockData) }
      ]
    });

    res.send(mockData);
});

// Get user data from Redis cache
app.get('/mock/user/:id', async (req: Request, res: Response) => {
    const userId = req.params.id;
    const userData = await redisClient.get(userId);

    if (!userData) {
      res.status(404).send('User not found');
    } else {
      res.send(JSON.parse(userData));
    }
});

const generateMockUser = () => {
      return {
        id: faker.seed(),
        name: faker.name.firstName() + ' ' + faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: {
          street: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip: faker.address.zipCode(),
        },
      };
};


app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


const run = async () => {
  await producer.connect();

  // Start the server
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Swagger docs are available at http://localhost:3000/api-docs');
  });

};

run().catch(console.error);


